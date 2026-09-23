const test = require("node:test");
const assert = require("node:assert/strict");
const { shape, kicksFor, samePlacement } = require("../dist/tetris-rules.js");
const openers = require("../dist/opener-data.js");

function emptyBoard() {
  return Array.from({ length: 22 }, () => Array(10).fill(null));
}

function place(board, type, desiredLeft, rotation, clearLines = true, fixedY) {
  const coords = shape(type, rotation);
  const minX = Math.min(...coords.map(([x]) => x));
  const x = desiredLeft - minX;
  const collides = y => coords.some(([sx,sy]) => {
    const px = x + sx, py = y + sy;
    return px < 0 || px >= 10 || py >= 22 || (py >= 0 && board[py][px]);
  });
  let y = Number.isInteger(fixedY) ? fixedY : 0;
  assert.equal(collides(y), false, `${type} target must be unoccupied`);
  if (!Number.isInteger(fixedY)) while (!collides(y + 1)) y++;
  for (const [sx,sy] of coords) board[y + sy][x + sx] = type;
  const cleared = board.filter(row => row.every(Boolean)).length;
  if (clearLines && cleared) {
    board = board.filter(row => !row.every(Boolean));
    while (board.length < 22) board.unshift(Array(10).fill(null));
  }
  return { board, cleared };
}

function build(opener, count = opener.sequence.length, clearLines = true) {
  let board = emptyBoard();
  let cleared = 0;
  for (let index = 0; index < count; index++) {
    const [left, rotation, fixedY] = opener.plan[index];
    const result = place(board, opener.sequence[index], left, rotation, clearLines, fixedY);
    board = result.board;
    cleared += result.cleared;
  }
  return { board, cleared };
}

function occupiedRows(board) {
  const first = board.findIndex(row => row.some(Boolean));
  return first < 0 ? [] : board.slice(first).map(row => row.map(cell => cell || "_").join(""));
}

function canReach(board, type, target) {
  const start = { x: 3, y: 0, rotation: 0 };
  const queue = [start];
  const seen = new Set([`${start.x},${start.y},${start.rotation}`]);
  const collides = piece => shape(type,piece.rotation).some(([sx,sy]) => {
    const x = piece.x + sx, y = piece.y + sy;
    return x < 0 || x >= 10 || y >= 22 || (y >= 0 && board[y][x]);
  });
  while (queue.length) {
    const current = queue.shift();
    if (current.x === target.x && current.y === target.y && current.rotation === target.rotation) return true;
    const candidates = [
      { ...current, x: current.x - 1 },
      { ...current, x: current.x + 1 },
      { ...current, y: current.y + 1 }
    ];
    for (const direction of [-1,1]) {
      const rotation = (current.rotation + direction + 4) % 4;
      for (const [dx,dy] of kicksFor(type,current.rotation,rotation)) {
        const kicked = { x: current.x + dx, y: current.y + dy, rotation };
        if (!collides(kicked)) { candidates.push(kicked); break; }
      }
    }
    for (const candidate of candidates) {
      const key = `${candidate.x},${candidate.y},${candidate.rotation}`;
      if (!seen.has(key) && !collides(candidate)) { seen.add(key); queue.push(candidate); }
    }
  }
  return false;
}

test("TKI-3 first six pieces form the canonical cavity", () => {
  const { board, cleared } = build(openers.tki, 6);
  assert.equal(cleared, 0);
  assert.deepEqual(occupiedRows(board), [
    "_______J__",
    "L__ZZ_SJJJ",
    "L___ZZSSOO",
    "LL_IIIISOO"
  ]);
});

test("S placement accepts the equivalent counter-clockwise rotation state", () => {
  const clockwiseTarget = { type: "S", x: 5, y: 19, rotation: 1 };
  const counterClockwisePlacement = { type: "S", x: 6, y: 19, rotation: 3 };
  assert.equal(samePlacement(clockwiseTarget,counterClockwisePlacement),true);
});

test("TKI-3 final T completes a two-line clear", () => {
  const { board } = build(openers.tki, 6);
  const [left,rotation,y] = openers.tki.plan[6];
  const minX = Math.min(...shape("T",rotation).map(([x])=>x));
  assert.equal(canReach(board,"T",{ x: left-minX, y, rotation }), true, "final T target must be reachable with SRS kicks");
  const { cleared } = build(openers.tki);
  assert.equal(cleared, 2);
});

test("DT Cannon first bag forms the canonical foundation", () => {
  const { board, cleared } = build(openers["dt-cannon"],7);
  assert.equal(cleared, 0);
  assert.deepEqual(occupiedRows(board), [
    "____T_____",
    "___TTTI___",
    "____SSIZZ_",
    "OO_SSLIJZZ",
    "OO_LLLIJJJ"
  ]);
});

test("DT Cannon bag 2 builds a reachable TSD", () => {
  const opener = openers["dt-cannon"];
  const { board, cleared } = build(opener,13);
  assert.equal(cleared,0);
  assert.deepEqual(occupiedRows(board),[
    "_____S____",
    "__LL_SS___",
    "___LZZS__I",
    "JJ_LTZZOOI",
    "J__TTTIOOI",
    "J___SSIZZI",
    "OO_SSLIJZZ",
    "OO_LLLIJJJ"
  ]);
  const [left,rotation,y] = opener.plan[13];
  const minX = Math.min(...shape("T",rotation).map(([x])=>x));
  assert.equal(canReach(board,"T",{ x:left-minX,y,rotation }),true);
});

test("DT Cannon completes its TSD and revealed TST", () => {
  const opener = openers["dt-cannon"];
  const afterTsd = build(opener,14);
  assert.equal(afterTsd.cleared,2);
  const [left,rotation,y] = opener.plan[14];
  const minX = Math.min(...shape("T",rotation).map(([x])=>x));
  assert.equal(canReach(afterTsd.board,"T",{ x:left-minX,y,rotation }),true);
  const complete = build(opener);
  assert.equal(complete.cleared,5);
  assert.deepEqual(occupiedRows(complete.board),[
    "_____S____",
    "__LL_SS___",
    "___LZZS__I"
  ]);
});

test("every selectable Tetris lesson has a complete reachable route", () => {
  for (const [id, opener] of Object.entries(openers)) {
    assert.equal(opener.sequence.length, opener.plan.length, `${id} must define one target per piece`);
    assert.equal(opener.steps.length, opener.plan.length, `${id} must explain every target`);
    let board = emptyBoard();
    for (let index = 0; index < opener.sequence.length; index++) {
      const type = opener.sequence[index];
      const [left, rotation, fixedY] = opener.plan[index];
      const minX = Math.min(...shape(type,rotation).map(([x]) => x));
      const target = { x: left - minX, y: Number.isInteger(fixedY) ? fixedY : 0, rotation };
      if (!Number.isInteger(fixedY)) {
        const coords = shape(type,rotation);
        const collides = y => coords.some(([sx,sy]) => {
          const x = target.x + sx, py = y + sy;
          return x < 0 || x >= 10 || py >= 22 || (py >= 0 && board[py][x]);
        });
        while (!collides(target.y + 1)) target.y++;
      }
      assert.equal(canReach(board,type,target),true,`${id} step ${index+1} (${type}) must be SRS-reachable`);
      board = place(board,type,left,rotation,true,fixedY).board;
    }
  }
});

test("MKO and Albatross fixed routes finish with a two-line clear", () => {
  assert.equal(build(openers.mko).cleared,2);
  assert.equal(build(openers.albatross).cleared,2);
});

test("Hachispin places Z second-last and spins the final T for a Single", () => {
  const opener = openers.hachispin;
  assert.equal(opener.sequence.slice(-2),"ZT");
  assert.equal(build(opener,opener.sequence.length-1).cleared,0);
  assert.equal(build(opener).cleared,1);
});

test("6–3 clean-stacking drill remains hole-free", () => {
  const { board } = build(openers["6-3"]);
  for (let x = 0; x < 10; x++) {
    let occupied = false;
    for (let y = 0; y < 22; y++) {
      if (board[y][x]) occupied = true;
      else if (occupied) assert.fail(`6–3 leaves a covered hole in column ${x+1}`);
    }
  }
});
