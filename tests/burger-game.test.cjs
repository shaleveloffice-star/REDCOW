const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');
const { newBurgerGame, stepBurgerGame, replayBurgerGame, gameNickname, GAME_MAX_TICKS } = createLoader()('@/lib/game/burger-game');
test('server replay gives the same score and rejects extra or invalid frames', () => {
  const game = newBurgerGame(1234), moves = [];
  while (!game.over) {
    const x = Math.round(Math.max(100, Math.min(900, game.burgers[0]?.x ?? 500)));
    moves.push(x); stepBurgerGame(game, x);
  }
  assert.ok(game.score > 0);
  assert.deepEqual(replayBurgerGame(1234, moves), game);
  assert.throws(() => replayBurgerGame(1234, [...moves, 500]));
  for (const invalid of [[], [NaN], [99], [901], [100.5], ['500'], Array(GAME_MAX_TICKS+1).fill(500)]) assert.throws(() => replayBurgerGame(1234, invalid));
  assert.throws(() => replayBurgerGame(1234, [500]), /not finished/);
});
test('three misses end a game and completed games stop advancing', () => {
  const game = newBurgerGame(7);
  while (!game.over) stepBurgerGame(game, 100);
  assert.ok(game.misses >= 3);
  const tick = game.tick;
  stepBurgerGame(game, 100);
  assert.equal(game.tick, tick);
});

test('fall speed compounds by 20 percent at each three-second boundary', () => {
  for (const [tick, expected] of [[1, 4], [89, 4], [90, 4.8], [179, 4.8], [180, 5.76], [270, 6.912], [1080, 4 * 1.2 ** 12]]) {
    const game = newBurgerGame(7);
    game.tick = tick - 1;
    game.next = GAME_MAX_TICKS + 1;
    game.burgers = [{ id: 1, x: 500, y: 0 }];
    stepBurgerGame(game, 500);
    assert.ok(Math.abs(game.burgers[0].y - expected) < 1e-10, `tick ${tick}`);
  }
});
test('nickname validation rejects markup, bidi controls and oversized names', () => {
  assert.equal(gameNickname('  שחקן 7  '), 'שחקן 7');
  for (const name of ['a', '<script>', 'a'.repeat(21), 'abc\u202e', null]) assert.throws(() => gameNickname(name));
});

test('score action stores server-computed result once, rejects expired sessions and requires admin for deletion', async () => {
  const game=newBurgerGame(1234),moves=[];
  while(!game.over){const x=Math.round(Math.max(100,Math.min(900,game.burgers[0]?.x??500)));moves.push(x);stepBurgerGame(game,x);}
  let data={seed:1234,startedAt:Date.now()-100000,used:false};
  const writes=[];
  let topScore = 0;
  let lastReset = 0;
  const load=createLoader({
    'node:crypto':require('node:crypto'),
    '@/lib/firebase/admin-runtime':{getAdminFirestore:async()=>({
      collection:name=>({doc:id=>({name,id}),orderBy:()=>({limit:()=>({query:true})})}),
      runTransaction:async callback=>callback({get:async ref=>ref.query?{docs:[{get:()=>topScore}]}:{data:()=>ref.name === "burgerGameSettings" ? {resetAt:lastReset} : data},create:(ref,value)=>writes.push({ref,value}),update:()=>{data.used=true;}})
    })},
    '@/lib/security/rate-limit':{getRequestClientIp:async()=> 'test',consumeRateLimitAsync:async()=>true},
    '@/lib/auth/admin-guard':{requireAdminRole:async()=>{throw Error('unauthorized');}},
    'next/cache':{revalidatePath(){}}
  });
  const actions=load('@/server/actions/burger-game.actions');
  const id='12345678-1234-1234-1234-123456789012';
  assert.equal((await actions.saveBurgerScoreAction(id,'Player',moves)).needsPhone,true);
  assert.equal(writes.length,0);
  assert.equal((await actions.saveBurgerScoreAction(id,'Player',moves,'0501234567')).ok,true);
  assert.equal(writes[0].value.score,game.score);
  assert.equal(writes[0].ref.name,'burgerGameScores');
  assert.equal('phone' in writes[0].value,false);
  assert.equal(writes[1].ref.name,'burgerGameContacts');
  assert.equal(writes[1].value.phone,'0501234567');
  assert.equal((await actions.saveBurgerScoreAction(id,'Player',moves,'0501234567')).ok,false);
  data={...data,used:false,startedAt:Date.now()-16*60000};
  assert.equal((await actions.saveBurgerScoreAction(id,'Player',moves,'0501234567')).ok,false);
  assert.equal(writes.length,2);
  data={...data,used:false,startedAt:Date.now()-100000};
  topScore=game.score;
  assert.equal((await actions.saveBurgerScoreAction(id,'Player',moves)).ok,true);
  assert.equal(writes.length,3);
  data={...data,used:false}; lastReset=Date.now();
  assert.equal((await actions.saveBurgerScoreAction(id,'Player',moves)).ok,false);
  assert.equal(writes.length,3);
  await assert.rejects(actions.deleteBurgerScoreAction(new FormData()),/unauthorized/);
});


test('phone is required and normalized, public leaderboard never returns contact data', async () => {
  const { gamePhone } = createLoader()('@/lib/game/burger-game');
  assert.equal(gamePhone('+972 50-123-4567'), '0501234567');
  for (const value of ['', undefined, 'abc', '12345', '<script>', '050123456789']) assert.throws(() => gamePhone(value));
  const source = { name:'Player', score:100, phone:'0501234567', createdAt:'private' };
  let reads = 0;
  const actions = createLoader({
    'node:crypto':require('node:crypto'),
    '@/lib/firebase/admin-runtime':{getAdminFirestore:async()=>({collection: name => {
      assert.equal(name,'burgerGameScores'); reads++;
      return {orderBy:()=>({limit:()=>({get:async()=>({docs:[{id:'one',get:key=>source[key]}]})})})};
    }})},
    '@/lib/auth/admin-guard':{requireAdminRole:async()=>{throw Error('unauthorized');}},
    '@/lib/security/rate-limit':{}, 'next/cache':{}
  })('@/server/actions/burger-game.actions');
  assert.deepEqual(await actions.getBurgerLeaderboard(), [{id:'one',name:'Player',score:100}]);
  await assert.rejects(actions.getAdminBurgerScores(), /unauthorized/);
  assert.equal(reads,1);
});

test('reset requires authorization and confirmation and deletes scores and contacts in bounded batches', async () => {
  let authorized=false, resetAt, commits=0;
  const deleted=[];
  const docs=Array.from({length:401},(_,i)=>({id:String(i),ref:{collection:'burgerGameScores',id:String(i)}}));
  const actions=createLoader({
    'node:crypto':require('node:crypto'),
    '@/lib/auth/admin-guard':{requireAdminRole:async()=>{if(!authorized)throw Error('unauthorized');}},
    '@/lib/security/rate-limit':{},
    'next/cache':{revalidatePath(){}},
    '@/lib/firebase/admin-runtime':{getAdminFirestore:async()=>({
      collection:name=>({
        doc:id=>({collection:name,id,set:async value=>{resetAt=value.resetAt;}}),
        where:(field,op,value)=>{assert.equal(field,'createdAt');assert.equal(op,'<=');assert.equal(value.getTime(),resetAt);return {get:async()=>({docs})};}
      }),
      batch:()=>{const entries=[];return {delete:ref=>entries.push(ref),commit:async()=>{assert.ok(entries.length<=400);deleted.push(...entries);commits++;}};}
    })}
  })('@/server/actions/burger-game.actions');
  await assert.rejects(actions.resetBurgerLeaderboardAction(true),/unauthorized/);
  authorized=true;
  await assert.rejects(actions.resetBurgerLeaderboardAction(false),/לאשר/);
  assert.equal(resetAt,undefined);
  await actions.resetBurgerLeaderboardAction(true);
  assert.equal(commits,3);
  assert.equal(deleted.length,802);
  assert.equal(deleted.filter(row=>row.collection==='burgerGameContacts').length,401);
});
