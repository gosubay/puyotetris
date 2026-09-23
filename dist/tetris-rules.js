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

  return { BASE_SHAPES, shape, kicksFor };
});
