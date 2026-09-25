(function (root) {
  "use strict";
  const copy = board => board.map(row => [...row]);
  const empty = () => Array.from({length:13}, () => Array(6).fill(null));
  const offset = r => [[0,-1],[1,0],[0,1],[-1,0]][r];
  function columns(cols) {
    const board = empty();
    cols.forEach((col,x) => [...col].forEach((color,h) => board[12-h][x] = color));
    return board;
  }
  // Use the same gravity and resolution for gameplay, lesson validation and replay.
  function settle(board) {
    for (let x=0;x<6;x++) {
      const values = board.map(row=>row[x]).filter(Boolean);
      for (let y=12;y>=0;y--) board[y][x] = values.pop() || null;
    }
  }
  function resolve(input) {
    const board = copy(input), frames = [];
    for (;;) {
      const seen = new Set(), cleared = [];
      for (let y=0;y<13;y++) for (let x=0;x<6;x++) {
        const color = board[y][x], key = y*6+x;
        if (!color || seen.has(key)) continue;
        const stack = [[x,y]], group = []; seen.add(key);
        while (stack.length) {
          const [cx,cy] = stack.pop(); group.push([cx,cy]);
          for (const [nx,ny] of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]]) {
            const k = ny*6+nx;
            if(nx>=0&&nx<6&&ny>=0&&ny<13&&!seen.has(k)&&board[ny][nx]===color) {
              seen.add(k); stack.push([nx,ny]);
            }
          }
        }
        if(group.length>=4) cleared.push(...group);
      }
      if (!cleared.length) break;
      const before = copy(board);
      cleared.forEach(([x,y])=>board[y][x]=null);
      settle(board);
      frames.push({before, cleared, after:copy(board)});
    }
    return {board, frames, chains:frames.length};
  }
  function place(input, colors, x, rotation) {
    const board = copy(input), [dx,dy] = offset(rotation);
    const collision = y => [[x,y],[x+dx,y+dy]].some(([cx,cy])=>cx<0||cx>=6||cy<0||cy>=13||board[cy][cx]);
    let y=1;
    if(collision(y)) return null;
    while(!collision(y+1)) y++;
    const cells = [[x,y,colors[0]],[x+dx,y+dy,colors[1]]].sort((a,b)=>b[1]-a[1]);
    for (const [cx,cy,c] of cells) {
      let h=cy;
      while(h<12&&!board[h+1][cx]) h++;
      board[h][cx]=c;
    }
    return {landed:copy(board), ...resolve(board)};
  }
  const move = (pair,x,r,text) => ({pair:[...pair],x,r,text});
  const fire = () => move("RY",0,0,"Add the trigger colour to the exposed group. Watch the separating group clear and the next group fall together.");
  const sandwich211 = [
    move("RR",0,0,"Build the two-puyo trigger column."),
    move("GG",1,0,"Build the bottom two puyos of the next link."),
    move("BB",2,0,"Build the bottom two puyos of the last link."),
    move("RG",1,1,"Place the separators across the two columns. They delay the connections above them."),
    move("GB",1,1,"Cap both links: each cap will fall when its separator disappears."),
    move("BY",3,1,"Add the fourth puyo for the final link beside its base. The other colour stays outside the chain."), fire()
  ];
  const sandwich112 = [
    move("RR",0,0,"Build the trigger column."),
    move("GR",1,0,"Place one base puyo with the separator above it."),
    move("BG",2,0,"Repeat that base-and-separator structure for the next link."),
    move("GB",1,1,"Add the first cap puyo above each separator."),
    move("GB",1,1,"Add the second cap. This is the 1–1–2 form: one below, separator, two above."),
    move("BY",3,1,"Complete the final link's colour count beside its base."), fire()
  ];
  const finishGtr = [
    move("RB",0,1,"Add the upper arm. The two colours remain separated until the trigger clears."),
    move("GB",2,0,"Support the outer puyo with a different colour, then complete the transition's second group."), fire()
  ];
  const sources = {
    sandwich:"https://puyo-camp.jp/posts/116414",
    gtr:"https://www.chueq.com/puyo/learn/gtr/"
  };
  function drill(id,name,family,cols,moves,goal,description,focus) {
    return {id,name,family,initial:columns(cols),moves,goal,description,focus,
      type:family === "sandwich" ? "Sandwich drill" : "GTR drill",
      condition:`Fire a ${goal}-chain · fixed teaching sequence`, source:sources[family]};
  }
  const catalog = [
    drill("sandwich-trigger","Sandwich · see the drop","sandwich",["RR","GGRG","G"],[fire()],2,
      "Start with a ready-made 2–1–1 Sandwich. Find its trigger and follow both links.",
      "The separator clears first. The cap falls onto the two below it and connects to the fourth puyo beside them."),
    drill("sandwich-complete","Sandwich · complete the caps","sandwich",["RR","GGR","BBG","B","Y"],sandwich211.slice(4,5).concat(fire()),3,
      "Finish two missing caps, then fire a three-chain.","A link needs four matching puyos after the drop, not four connected before it."),
    drill("sandwich-211","Sandwich · build 2–1–1","sandwich",[],sandwich211,3,
      "Build a three-chain from an empty board, then fire it.","Two matching puyos below, a separating colour, and one matching puyo above form each 2–1–1 link."),
    drill("sandwich-112","Sandwich · build 1–1–2","sandwich",[],sandwich112,3,
      "Build the same chain mechanism with one below and two above the separator.","The cap can contain two puyos instead of one. The separating colour still controls when the link connects."),
    drill("gtr-trigger","GTR · fire the transition","gtr",["BRR","BRB","GB"],[fire()],2,
      "Fire a prepared GTR corner and inspect how its two groups connect.","The trigger clears the inner group. Gravity brings the upper puyo down to connect the outer group."),
    drill("gtr-aabb","GTR · AA → BB","gtr",[],[
      move("BB",0,1,"Lay the first double across the two columns at the wall."),
      move("RR",0,1,"Lay the second double directly above it."),...finishGtr],2,
      "Practise two different doubles, then complete and fire a compact GTR.","A and B describe colour relationships, not specific colours. This drill teaches one fixed continuation."),
    drill("gtr-abab","GTR · AB → AB","gtr",[],[
      move("BR",0,0,"Stand the first mixed pair at the wall."),
      move("BR",1,0,"Stand the matching pair beside it with the same colour below."),...finishGtr],2,
      "Reach the same GTR foundation using two matching mixed pairs.","The first two moves reach the same board as the two-double opening. Different pair orders can share a continuation."),
    drill("gtr-abac","GTR · AB → AC","gtr",[],[
      move("BR",0,0,"Stand the first mixed pair at the wall."),
      move("BG",1,1,"Lay the shared colour beside the base and the third colour beside that."),
      move("RR",0,1,"Split this double across the uneven columns to form the inner arm."),
      move("BB",1,1,"Split the outer-colour double across the uneven columns to complete the transition."),fire()],2,
      "Use two mixed pairs sharing one colour, then finish the GTR transition.","A horizontal pair can land at different heights. Its two halves fall independently after landing.")
  ];
  function variant(id, permutation=["R","G","B","Y"], mirror=false) {
    const base=catalog.find(d=>d.id===id);
    if(!base) throw new Error("Unknown Puyo drill");
    const map=Object.fromEntries(["R","G","B","Y"].map((c,i)=>[c,permutation[i]]));
    const initial=base.initial.map(row=>{
      const result=row.map(c=>c ? map[c] : null); return mirror ? result.reverse() : result;
    });
    return {...base,initial,mirror,moves:base.moves.map(m=>({...m,pair:m.pair.map(c=>map[c]),
      x:mirror?5-m.x:m.x,r:mirror?({0:0,1:3,2:2,3:1}[m.r]):m.r}))};
  }
  const api={empty,columns,copy,settle,resolve,place,catalog,variant};
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  else root.StackLabPuyo=api;
})(typeof window!=="undefined"?window:globalThis);
