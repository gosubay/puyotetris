const test = require('node:test');
const assert = require('node:assert/strict');
const p = require('../dist/puyo-drills');

function permutations(a) {
  return a.length ? a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(rest=>[v,...rest])) : [[]];
}

for (const base of p.catalog) test(`${base.name}: all 48 colour / mirror variations fire only at the end`,()=>{
  for (const palette of permutations(['R','G','B','Y'])) for (const mirror of [false,true]) {
    const d=p.variant(base.id,palette,mirror);
    let board=d.initial;
    assert.equal(p.resolve(board).chains,0,'Initial puzzle must be stable');
    for (const [i,m] of d.moves.entries()) {
      const before=JSON.stringify(board), result=p.place(board,m.pair,m.x,m.r);
      assert.ok(result,'Placement is legal');
      assert.equal(JSON.stringify(board),before,'Simulation does not mutate input');
      assert.equal(result.chains,i===d.moves.length-1?d.goal:0,'No premature clears');
      const beforeCount=board.flat().filter(Boolean).length+2;
      assert.equal(result.board.flat().filter(Boolean).length+result.frames.reduce((n,f)=>n+f.cleared.length,0),beforeCount,'Every puyo is accounted for');
      for (const frame of result.frames) {
        assert.ok(frame.cleared.length>=4);
        for (let x=0;x<6;x++) {
          let occupied=false;
          for(let y=0;y<13;y++) {
            if(frame.after[y][x]) occupied=true;
            else assert.equal(occupied,false,'Gravity leaves no holes');
          }
        }
      }
      board=result.board;
    }
  }
});

test('Sandwich fixture clears red, then green, then blue with the expected falling caps',()=>{
  const board=p.columns(['RR','GGRG','BBGB','B','Y']);
  const result=p.place(board,['R','Y'],0,0);
  assert.deepEqual(result.frames.map(f=>[...new Set(f.cleared.map(([x,y])=>f.before[y][x]))]),[['R'],['G'],['B']]);
  assert.equal(result.frames[0].after[10][1],'G');
  assert.equal(result.frames[1].after[10][2],'B');
  assert.equal(result.board.flat().filter(Boolean).length,2);
});

test('All three GTR opening families reach the same canonical transition',()=>{
  const target=p.columns(['BRR','BRB','GB']);
  for (const id of ['gtr-aabb','gtr-abab','gtr-abac']) {
    let board=p.empty();
    for(const m of p.variant(id).moves.slice(0,-1)) board=p.place(board,m.pair,m.x,m.r).board;
    assert.deepEqual(board,target);
  }
});

test('Horizontal pairs split under gravity and doubles accept equivalent orientations',()=>{
  const input=p.columns(['R']);
  const split=p.place(input,['G','B'],0,1);
  assert.equal(split.board[11][0],'G');assert.equal(split.board[12][1],'B');
  assert.deepEqual(p.place(p.empty(),['R','R'],0,1).board,p.place(p.empty(),['R','R'],1,3).board);
  assert.equal(p.place(p.empty(),['R','G'],5,1),null);
  assert.equal(p.place(p.columns(['R'.repeat(13)]),['G','B'],0,0),null);
});

test('Separate groups clear simultaneously as one chain link',()=>{
  const result=p.resolve(p.columns(['RRRR','', 'GGGG']));
  assert.equal(result.chains,1);assert.equal(result.frames[0].cleared.length,8);
});
