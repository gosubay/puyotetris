(function (root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) module.exports = rules;
  if (root) root.StackLabTetrisRules = rules;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const BASE_SHAPES = {
    I: [[0,1],[1,1],[2,1],[3,1]], O: [[1,0],[2,0],[1,1],[2,1]],
    T: [[1,0],[0,1],[1,1],[2,1]], S: [[1,0],[2,0],[0,1],[1,1]],
    Z: [[0,0],[1,0],[1,1],[2,1]], J: [[0,0],[0,1],[1,1],[2,1]],
    L: [[2,0],[0,1],[1,1],[2,1]]
  };

  function buildRotationStates(type) {
    if (type === "O") return Array.from({ length: 4 }, () => BASE_SHAPES.O.map(p => [...p]));
    const states = [BASE_SHAPES[type].map(p => [...p])];
    for (let rotation = 1; rotation < 4; rotation++) {
      const previous = states[rotation - 1];
      states.push(previous.map(([x,y]) => type === "I" ? [3 - y, x] : [2 - y, x]));
    }
    return states;
  }

  const SHAPE_STATES = Object.fromEntries(Object.keys(BASE_SHAPES).map(type => [type, buildRotationStates(type)]));

  // Guideline SRS offsets converted to canvas coordinates, where positive Y points down.
  const JLSTZ_KICKS = {
    "0>1": [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    "1>0": [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    "1>2": [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    "2>1": [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    "2>3": [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    "3>2": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    "3>0": [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    "0>3": [[0,0],[1,0],[1,-1],[0,2],[1,2]]
  };

  const I_KICKS = {
    "0>1": [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
    "1>0": [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
    "1>2": [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
    "2>1": [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
    "2>3": [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
    "3>2": [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
    "3>0": [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
    "0>3": [[0,0],[-1,0],[2,0],[-1,-2],[2,1]]
  };

  function shape(type, rotation = 0) {
    return SHAPE_STATES[type][((rotation % 4) + 4) % 4];
  }

  function kicksFor(type, from, to) {
    if (type === "O") return [[0,0]];
    return (type === "I" ? I_KICKS : JLSTZ_KICKS)[`${from}>${to}`];
  }

  function occupiedCells(piece) {
    return shape(piece.type,piece.rotation)
      .map(([x,y]) => [piece.x + x,piece.y + y])
      .sort(([ax,ay],[bx,by]) => ay - by || ax - bx);
  }

  function samePlacement(first, second) {
    if (!first || !second || first.type !== second.type) return false;
    const a = occupiedCells(first), b = occupiedCells(second);
    return a.length === b.length && a.every(([x,y],index) => x === b[index][0] && y === b[index][1]);
  }

  function classifyTSpin(board, piece) {
    if (!piece || piece.type !== "T" || piece.lastAction !== "rotate") return null;
    const pivotX = piece.x + 1, pivotY = piece.y + 1;
    const occupied = (x,y) => x < 0 || x >= 10 || y < 0 || y >= board.length || Boolean(board[y][x]);
    const corners = [[-1,-1],[1,-1],[-1,1],[1,1]];
    if (corners.filter(([dx,dy]) => occupied(pivotX+dx,pivotY+dy)).length < 3) return null;
    const front = [
      [[-1,-1],[1,-1]], [[1,-1],[1,1]], [[-1,1],[1,1]], [[-1,-1],[-1,1]]
    ][((piece.rotation % 4) + 4) % 4];
    const full = front.every(([dx,dy]) => occupied(pivotX+dx,pivotY+dy)) || piece.lastKickIndex === 4;
    return full ? "full" : "mini";
  }

  function guidelineScore({ lines = 0, spin = null, backToBack = false, combo = -1, perfectClear = false, level = 1 }) {
    const normal = [0,100,300,500,800];
    const fullSpin = [400,800,1200,1600];
    const miniSpin = [100,200,400];
    let base = spin === "full" ? (fullSpin[lines] || 0) : spin === "mini" ? (miniSpin[lines] || 0) : (normal[lines] || 0);
    const difficult = lines > 0 && (spin !== null || lines === 4);
    if (difficult && backToBack) base = Math.floor(base * 1.5);
    const comboBonus = lines > 0 && combo > 0 ? 50 * combo : 0;
    const pc = perfectClear ? ([0,800,1200,1800,backToBack ? 3200 : 2000][lines] || 0) : 0;
    return { points: (base + comboBonus + pc) * level, difficult };
  }

  return { BASE_SHAPES, shape, kicksFor, occupiedCells, samePlacement, classifyTSpin, guidelineScore };
});
