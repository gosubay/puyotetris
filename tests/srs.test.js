"use strict";

const assert = require("node:assert/strict");
const { shape, kicksFor } = require("../dist/tetris-rules.js");

function collides(piece) {
  return shape(piece.type, piece.rotation).some(([sx,sy]) => {
    const x = piece.x + sx;
    const y = piece.y + sy;
    return x < 0 || x >= 10 || y < 0 || y >= 22;
  });
}

function rotate(piece, direction) {
  const next = (piece.rotation + direction + 4) % 4;
  for (const [dx,dy] of kicksFor(piece.type, piece.rotation, next)) {
    const candidate = { ...piece, x: piece.x + dx, y: piece.y + dy, rotation: next };
    if (!collides(candidate)) return candidate;
  }
  return null;
}

assert.deepEqual(shape("T", 0), [[1,0],[0,1],[1,1],[2,1]], "T spawn state must use its SRS pivot frame");

const tFloorKick = rotate({ type: "T", x: 4, y: 20, rotation: 0 }, 1);
assert.deepEqual(tFloorKick, { type: "T", x: 3, y: 19, rotation: 1 }, "T should use the SRS upward floor kick");

const tWallKick = rotate({ type: "T", x: -1, y: 8, rotation: 1 }, -1);
assert.deepEqual(tWallKick, { type: "T", x: 0, y: 8, rotation: 0 }, "T should kick away from the left wall");

const iWallKick = rotate({ type: "I", x: 7, y: 8, rotation: 1 }, 1);
assert.deepEqual(iWallKick, { type: "I", x: 6, y: 8, rotation: 2 }, "I should use its separate SRS kick table");

for (const transition of [[0,1],[1,0],[1,2],[2,1],[2,3],[3,2],[3,0],[0,3]]) {
  assert.equal(kicksFor("T", ...transition).length, 5);
  assert.equal(kicksFor("I", ...transition).length, 5);
}

console.log("SRS rotation states and kick tests passed.");
