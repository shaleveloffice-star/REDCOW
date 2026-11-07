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
test('nickname validation rejects markup, bidi controls and oversized names', () => {
  assert.equal(gameNickname('  שחקן 7  '), 'שחקן 7');
  for (const name of ['a', '<script>', 'a'.repeat(21), 'abc\u202e', null]) assert.throws(() => gameNickname(name));
});

test('score action stores server-computed result once, rejects expired sessions and requires admin for deletion', async () => {
  const game=newBurgerGame(1234),moves=[];
  while(!game.over){const x=Math.round(Math.max(100,Math.min(900,game.burgers[0]?.x??500)));moves.push(x);stepBurgerGame(game,x);}
  let data={seed:1234,startedAt:Date.now()-100000,used:false};
  const writes=[];
  const load=createLoader({
    'node:crypto':require('node:crypto'),
    '@/lib/firebase/admin-runtime':{getAdminFirestore:async()=>({
      collection:name=>({doc:id=>({name,id})}),
      runTransaction:async callback=>callback({get:async()=>({data:()=>data}),create:(ref,value)=>writes.push({ref,value}),update:()=>{data.used=true;}})
    })},
    '@/lib/security/rate-limit':{getRequestClientIp:async()=> 'test',consumeRateLimitAsync:async()=>true},
    '@/lib/auth/admin-guard':{requireAdminRole:async()=>{throw Error('unauthorized');}},
    'next/cache':{revalidatePath(){}}
  });
  const actions=load('@/server/actions/burger-game.actions');
  const id='12345678-1234-1234-1234-123456789012';
  assert.equal((await actions.saveBurgerScoreAction(id,'Player',moves)).ok,true);
  assert.equal(writes[0].value.score,game.score);
  assert.equal((await actions.saveBurgerScoreAction(id,'Player',moves)).ok,false);
  data={...data,used:false,startedAt:Date.now()-16*60000};
  assert.equal((await actions.saveBurgerScoreAction(id,'Player',moves)).ok,false);
  assert.equal(writes.length,1);
  await assert.rejects(actions.deleteBurgerScoreAction(new FormData()),/unauthorized/);
});
