const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');
const { creatorPosition } = createLoader()('@/lib/recommendations/continuous-carousel');
test('six creators occupy exactly two rows of three without duplication', () => {
  assert.deepEqual(Array.from({length:6},(_,i)=>creatorPosition(i,6)), [
    {row:1,slot:0},{row:1,slot:1},{row:1,slot:2},{row:2,slot:0},{row:2,slot:1},{row:2,slot:2}
  ]);
});
test('each full row stays covered through repeated wraps, including odd creator counts', () => {
  for(let count=6;count<=15;count++) for(let distance=0;distance<count*4;distance+=0.13) {
    const positions=Array.from({length:count},(_,i)=>creatorPosition(i,count,distance));
    for(const row of [1,2]) {
      const slots=positions.filter(p=>p.row===row).map(p=>p.slot).sort((a,b)=>a-b);
      assert.equal(new Set(slots).size,slots.length);
      assert.ok(slots[0]<=0 && slots.at(-1)>=2);
      for(let i=1;i<slots.length;i++) assert.ok(Math.abs(slots[i]-slots[i-1]-1)<1e-8);
    }
  }
});
test('fewer creators are not duplicated to fill six slots',()=>{
  for(let count=1;count<=5;count++) {
    const positions=Array.from({length:count},(_,i)=>creatorPosition(i,count,100));
    assert.equal(new Set(positions.map(p=>`${p.row}:${p.slot}`)).size,count);
    assert.ok(positions.every(p=>p.row<=2 && p.slot>=0 && p.slot<3));
  }
});
