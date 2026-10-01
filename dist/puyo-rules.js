(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StackLabPuyoRules = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function offsets(rotation) { return [[0,-1],[1,0],[0,1],[-1,0]][((rotation % 4) + 4) % 4]; }
  function cells(pair, x = pair.x, y = pair.y, rotation = pair.rotation) {
    const [dx,dy] = offsets(rotation);
    return [[x,y,pair.colors[0]],[x+dx,y+dy,pair.colors[1]]];
  }
  function collides(board, pair, dx = 0, dy = 0, rotation = pair.rotation) {
    return cells(pair,pair.x+dx,pair.y+dy,rotation).some(([x,y]) =>
      x < 0 || x >= board[0].length || y >= board.length || (y >= 0 && !!board[y][x]));
  }
  function landing(board, pair) {
    if (collides(board,pair)) return null;
    let y = pair.y;
    while (!collides(board,{...pair,y},0,1)) y++;
    return y;
  }
  // Work on a copy: even a partially obstructed pair cannot overwrite a cell.
  function place(board, pair) {
    if (collides(board,pair) || cells(pair).some(([,y]) => y < 0)) return null;
    const result = board.map(row => [...row]);
    for (const [x,initialY,color] of cells(pair).sort((a,b) => b[1]-a[1])) {
      let y = initialY;
      while (y+1 < result.length && !result[y+1][x]) y++;
      if (result[y][x]) return null;
      result[y][x] = color;
    }
    return result;
  }
  function settle(board) {
    const result = board.map(row => [...row]);
    for (let x=0;x<result[0].length;x++) {
      const values = [];
      for (let y=result.length-1;y>=0;y--) if (result[y][x]) values.push(result[y][x]);
      for (let y=result.length-1,i=0;y>=0;y--,i++) result[y][x] = values[i] || null;
    }
    return result;
  }
  function groups(board) {
    const seen = new Set(), found = [];
    for (let y=0;y<board.length;y++) for (let x=0;x<board[0].length;x++) {
      const key = `${x},${y}`, color = board[y][x];
      if (!color || seen.has(key)) continue;
      const group = [], stack = [[x,y]]; seen.add(key);
      while (stack.length) {
        const [cx,cy] = stack.pop(); group.push([cx,cy]);
        for (const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]) {
          const nk = `${nx},${ny}`;
          if (nx>=0 && nx<board[0].length && ny>=0 && ny<board.length && !seen.has(nk) && board[ny][nx]===color) {
            seen.add(nk); stack.push([nx,ny]);
          }
        }
      }
      if (group.length>=4) found.push(group);
    }
    return found;
  }
  function resolve(board) {
    let result = board.map(row => [...row]), chains = 0;
    while (true) {
      const clear = groups(result);
      if (!clear.length) return {board:result,chains};
      chains++;
      clear.flat().forEach(([x,y]) => {result[y][x] = null;});
      result = settle(result);
    }
  }
  return {offsets,cells,collides,landing,place,settle,groups,resolve};
});
