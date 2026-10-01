"use strict";
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");
const rules = require("../dist/puyo-rules");
const random = require("../dist/puyo-randomizer");
const patterns = require("../dist/puyo-patterns");
const board = () => Array.from({length:13},() => Array(6).fill(null));
const piece = {x:2,y:1,rotation:0,colors:["R","G"]};
assert.deepEqual(rules.cells(piece),[[2,1,"R"],[2,0,"G"]]);
for (let r=0;r<4;r++) assert.equal(rules.collides(board(),{...piece,rotation:r}),false);
assert(rules.collides(board(),{...piece,x:0,rotation:3}));
assert(rules.collides(board(),{...piece,x:5,rotation:1}));
assert(rules.collides(board(),{...piece,y:12,rotation:2}));
assert.equal(rules.landing(board(),piece),12);
const split = board(); split[12][2]="B"; split[11][2]="B";
const horizontal = {...piece,rotation:1};
const placed = rules.place(split,{...horizontal,y:rules.landing(split,horizontal)});
assert.equal(placed[10][2],"R"); assert.equal(placed[12][3],"G");
assert.equal(split[10][2],null); // Pure placement, no input mutation.
const blocked=board(); blocked[0][2]="B";
assert.equal(rules.landing(blocked,piece),null); assert.equal(rules.place(blocked,piece),null);
assert.equal(blocked[0][2],"B");
const simultaneous=board(); for(let x=0;x<4;x++){simultaneous[12][x]="R";simultaneous[11][x]="G";}
assert.equal(rules.groups(simultaneous).length,2);
assert.equal(rules.resolve(simultaneous).chains,1);
const chain=board(); chain[12]=["R","R","G","G",null,null];chain[11][0]="R";chain[11][1]="R";chain[10][0]="G";chain[10][1]="G";
assert.equal(rules.resolve(chain).chains,2);
assert(rules.resolve(chain).board.flat().every(c=>!c));

for (const golden of require("./puyo-golden.json")) {
  const stream=random.create(golden.seed);
  assert.equal(stream.rng,golden.rng); assert.equal(stream.palette.join(""),golden.palette);
  for(const n of [3,4,5]) assert.equal(createHash("sha256").update(Buffer.from(stream.pools[n])).digest("hex"),golden.hashes[n]);
  assert.equal(Array.from({length:16},()=>random.nextPair(stream).join("")).join(""),golden.prefix);
}
// All possible source uint16 seeds, not probabilistic samples.
for(let seed=0;seed<65536;seed++) {
  const s=random.create(seed);
  assert(new Set([...random.nextPair(s),...random.nextPair(s)]).size<=3);
}
assert.equal(random.create("0x1234").seed,4660);
for(const invalid of ["",-1,65536,"1.5","oops"]) assert.throws(()=>random.create(invalid));
const stream=random.create(42), first=Array.from({length:128},()=>random.nextPair(stream));
assert.deepEqual(random.nextPair(stream),first[0]);
stream.cursor=254;
const saved=JSON.parse(JSON.stringify(stream));
const continuation=Array.from({length:10},()=>random.nextPair(stream));
assert.deepEqual(Array.from({length:10},()=>random.nextPair(saved)),continuation);
const prefix=random.create(42), prefetch=random.create(42);
const expected=Array.from({length:300},()=>random.nextPair(prefix));
const queue=[];const actual=[];
for(let i=0;i<300;i++){while(queue.length<17)queue.push(random.nextPair(prefetch));actual.push(queue.shift());}
assert.deepEqual(actual,expected);
assert.equal(patterns.length,6);
for(const pattern of patterns){assert(pattern.grid.length<=12);assert(pattern.grid.every(row=>row.length===6&&/^[ABCD.#]+$/.test(row)));}
// Exact source examples, with supported fixtures in the existing 13-row model.
for(const [index,count] of [[0,5],[1,5],[3,6],[4,6],[5,6]]){
  const pattern=patterns[index], fixture=board();
  pattern.grid.forEach((row,y)=>[...row].forEach((c,x)=>{fixture[13-pattern.grid.length+y][x]=c==='.'?null:c;}));
  if(!pattern.trigger.included)fixture[13-pattern.grid.length+pattern.trigger.y][pattern.trigger.x]=pattern.trigger.role;
  assert.equal(rules.resolve(fixture).chains,count,pattern.name);
}
assert.equal(patterns[2].kind,"foundation");
console.log("Puyo rules, independent golden pools, all 65,536 openings, rollover, snapshots and references passed.");
