(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StackLabPuyoRandomizer = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const ALGORITHM = "20th-anniversary-v1";
  function normalizeSeed(input) {
    const text = String(input).trim();
    if (!/^(?:\d+|0x[\da-f]+)$/i.test(text)) throw new Error("Use a seed from 0 to 65535 (decimal or 0x hex).");
    const value = Number(text);
    if (!Number.isSafeInteger(value) || value<0 || value>65535) throw new Error("Seed must be between 0 and 65535.");
    return value;
  }
  function rand(seed, modulo) {
    const next = (Math.imul(seed,0x5d588b65) + 0x00269ec3) >>> 0;
    return [next, Math.floor((next >>> 16)*modulo/65536)];
  }
  function create(input) {
    const seed = normalizeSeed(input);
    let rng = seed;
    const remaining = "RGBYP".split(""), palette = [], pools = {};
    for (let left=5;left>0;left--) {
      let index; [rng,index] = rand(rng,left);
      palette.push(remaining.splice(index,1)[0]);
    }
    for (let colors=3;colors<=5;colors++) {
      const pool = Array.from({length:256},(_,i) => i%colors);
      for (const length of [16,32,64]) for (let row=0;row<256/length-1;row++) for (let swap=0;swap<length/2;swap++) {
        let a,b; [rng,a] = rand(rng,length); [rng,b] = rand(rng,length);
        a += row*length; b += (row+1)*length;
        [pool[a],pool[b]] = [pool[b],pool[a]];
      }
      pools[colors] = pool;
    }
    pools[4].splice(0,4,...pools[3].slice(0,4));
    pools[5].splice(0,4,...pools[3].slice(0,4));
    return {algorithm:ALGORITHM,originalSeed:String(input),seed,rng,palette,pools,cursor:0};
  }
  // The 256 individual Puyos repeat (128 pairs); consuming never rerolls a pool.
  function nextPair(state) {
    if (state.algorithm!==ALGORITHM) throw new Error("Unsupported Puyo stream version");
    const pair = [0,1].map(offset => state.palette[state.pools[4][(state.cursor+offset)%256]]);
    state.cursor += 2;
    return pair;
  }
  return {ALGORITHM,normalizeSeed,rand,create,nextPair};
});
