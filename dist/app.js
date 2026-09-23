(() => {
  "use strict";

  const lessons = window.STACK_LAB_LESSONS;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const canvas = $("#gameCanvas");
  const ctx = canvas.getContext("2d");
  const holdCtx = $("#holdCanvas").getContext("2d");
  const nextCtx = $("#nextCanvas").getContext("2d");
  const coachCtx = $("#coachPiece").getContext("2d");

  const TETRIS_COLORS = {
    I: "#42d9ee", O: "#ffd54a", T: "#b86cff", S: "#63db68",
    Z: "#ff5d67", J: "#4b7cff", L: "#ff9f43"
  };
  const PUYO_COLORS = { R: "#ff5470", G: "#58db78", B: "#4fa5ff", Y: "#ffd957" };

  const BASE_SHAPES = {
    I: [[0,1],[1,1],[2,1],[3,1]], O: [[1,0],[2,0],[1,1],[2,1]],
    T: [[1,0],[0,1],[1,1],[2,1]], S: [[1,0],[2,0],[0,1],[1,1]],
    Z: [[0,0],[1,0],[1,1],[2,1]], J: [[0,0],[0,1],[1,1],[2,1]],
    L: [[2,0],[0,1],[1,1],[2,1]]
  };

  const PLAN_LIBRARY = {
    tki: [[0,0],[4,0],[3,2],[6,0],[1,0],[7,0],[7,0]],
    "dt-cannon": [[0,0],[7,0],[3,0],[5,0],[1,1],[4,0],[4,0]],
    pco: [[0,0],[2,0],[7,0],[5,0],[2,0],[4,0],[7,0]],
    dpc: [[3,2],[0,1],[2,0],[7,1],[5,0],[6,0],[8,0]],
    gamushiro: [[0,0],[7,0],[4,0],[0,0],[7,0],[3,0],[3,0]],
    hachispin: [[3,2],[0,0],[7,0],[4,0],[0,1],[6,0],[1,0]],
    "st-stack": [[0,0],[7,0],[4,0],[0,0],[4,1],[7,0],[2,0]],
    albatross: [[0,0],[7,0],[1,0],[6,0],[3,0],[3,0],[5,0]],
    mko: [[0,0],[7,0],[3,0],[5,0],[0,1],[4,0],[4,0]],
    "6-3": [[9,1],[0,0],[3,0],[6,0],[0,0],[4,0],[6,0]]
  };

  const PUYO_PLANS = {
    gtr: [[0,1],[1,0],[2,1],[0,0],[1,1],[3,0],[2,0],[4,1]],
    stairs: [[0,0],[1,0],[1,1],[2,0],[2,1],[3,0],[3,1],[4,0]],
    sandwich: [[0,1],[1,0],[0,0],[2,1],[1,0],[3,1],[2,0],[4,0]],
    "gtr-extension": [[0,1],[1,0],[2,1],[3,0],[4,1],[2,0],[5,0],[4,0]],
    tailing: [[5,0],[4,1],[3,0],[5,0],[4,0],[2,1],[3,0],[1,0]],
    transition: [[0,1],[1,0],[2,0],[1,1],[3,0],[2,1],[4,0],[5,0]]
  };

  const DEFAULT_KEYS = {
    left: "ArrowLeft", right: "ArrowRight", softDrop: "ArrowDown", hardDrop: "ArrowUp",
    rotateCCW: "a", rotateCW: "s", hold: "w", hint: "h", undo: "Backspace", pause: "Enter"
  };
  const ACTION_LABELS = {
    left: "Move left", right: "Move right", softDrop: "Soft drop", hardDrop: "Hard drop",
    rotateCCW: "Rotate counter-clockwise", rotateCW: "Rotate clockwise", hold: "Hold",
    hint: "Show hint", undo: "Undo", pause: "Pause"
  };

  const state = {
    game: "tetris", mode: "lesson", lessonIndex: 0, step: 0, paused: false,
    showHint: true, speed: 5, keys: loadKeys(), lastTime: 0, fallAccumulator: 0,
    undo: null, warning: "", recommendation: "", tetris: null, puyo: null
  };

  function loadKeys() {
    try { return { ...DEFAULT_KEYS, ...JSON.parse(localStorage.getItem("stackLabKeys")) }; }
    catch { return { ...DEFAULT_KEYS }; }
  }

  function rotateCoords(coords) {
    return coords.map(([x,y]) => [3 - y, x]);
  }

  function shape(type, rotation = 0) {
    let result = BASE_SHAPES[type].map(p => [...p]);
    if (type === "O") return result;
    for (let i = 0; i < ((rotation % 4) + 4) % 4; i++) result = rotateCoords(result);
    const minX = Math.min(...result.map(p => p[0]));
    const minY = Math.min(...result.map(p => p[1]));
    return result.map(([x,y]) => [x - minX, y - minY]);
  }

  function emptyBoard(width, height) {
    return Array.from({ length: height }, () => Array(width).fill(null));
  }

  function shuffle(items) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function activeLesson() { return lessons[state.game][state.lessonIndex]; }

  function initTetris() {
    const lesson = activeLesson();
    const queue = state.mode === "lesson" ? lesson.sequence.split("") : shuffle(Object.keys(BASE_SHAPES));
    state.tetris = { board: emptyBoard(10, 22), queue, bag: [], hold: null, heldThisTurn: false, active: null, lockMs: 0, lines: 0 };
    ensureTetrisQueue();
    spawnTetris();
    if (state.mode === "play") updateTetrisRecommendation();
  }

  function ensureTetrisQueue() {
    const t = state.tetris;
    while (t.queue.length < 8) t.queue.push(...shuffle(Object.keys(BASE_SHAPES)));
  }

  function spawnTetris(forcedType) {
    const t = state.tetris;
    ensureTetrisQueue();
    const type = forcedType || t.queue.shift();
    t.active = { type, x: 3, y: 0, rotation: 0 };
    t.heldThisTurn = false;
    t.lockMs = 0;
    ensureTetrisQueue();
    if (collidesTetris(t.active)) {
      showToast("Stack topped out — restarting");
      setTimeout(resetGame, 450);
    }
    updateCoach();
  }

  function cellsFor(piece, dx = 0, dy = 0, rotation = piece.rotation) {
    return shape(piece.type, rotation).map(([x,y]) => [piece.x + x + dx, piece.y + y + dy]);
  }

  function collidesTetris(piece, dx = 0, dy = 0, rotation = piece.rotation) {
    return cellsFor(piece, dx, dy, rotation).some(([x,y]) => x < 0 || x >= 10 || y >= 22 || (y >= 0 && state.tetris.board[y][x]));
  }

  function ghostY(piece, board = state.tetris.board) {
    let y = piece.y;
    const probe = { ...piece };
    const collision = (py) => shape(probe.type, probe.rotation).some(([sx,sy]) => {
      const x = probe.x + sx, yy = py + sy;
      return x < 0 || x >= 10 || yy >= 22 || (yy >= 0 && board[yy][x]);
    });
    while (!collision(y + 1)) y++;
    return y;
  }

  function moveTetris(dx, dy) {
    const p = state.tetris.active;
    if (!collidesTetris(p, dx, dy)) {
      p.x += dx; p.y += dy; state.tetris.lockMs = 0; return true;
    }
    return false;
  }

  function rotateTetris(direction) {
    const p = state.tetris.active;
    const next = (p.rotation + direction + 4) % 4;
    const kicks = [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[0,-2]];
    for (const [dx,dy] of kicks) {
      if (!collidesTetris(p, dx, dy, next)) {
        p.x += dx; p.y += dy; p.rotation = next; state.tetris.lockMs = 0; return;
      }
    }
  }

  function snapshot() {
    state.undo = {
      game: state.game, mode: state.mode, lessonIndex: state.lessonIndex, step: state.step,
      tetris: state.tetris ? JSON.parse(JSON.stringify(state.tetris)) : null,
      puyo: state.puyo ? JSON.parse(JSON.stringify(state.puyo)) : null
    };
    $("#undoButton").disabled = false;
  }

  function lockTetris() {
    const t = state.tetris, p = t.active;
    const expectedTarget = state.mode === "lesson" ? lessonTetrisTarget(true) : null;
    snapshot();
    const landedY = p.y;
    for (const [x,y] of cellsFor(p)) if (y >= 0) t.board[y][x] = p.type;
    let cleared = 0;
    t.board = t.board.filter(row => {
      if (row.every(Boolean)) { cleared++; return false; }
      return true;
    });
    while (t.board.length < 22) t.board.unshift(Array(10).fill(null));
    t.lines += cleared;

    if (state.mode === "lesson") {
      const target = expectedTarget;
      const correct = target && p.type === target.type && p.x === target.x && landedY === target.y && p.rotation % 4 === target.rotation % 4;
      if (correct) {
        state.step++;
        state.warning = "";
        showToast(state.step >= activeLesson().sequence.length ? "Foundation complete!" : "Good placement");
      } else {
        state.warning = "That placement changes the planned formation. Undo to retry the recommended move.";
        showToast("Different placement — undo is available");
      }
    }
    spawnTetris();
    if (state.mode === "play") updateTetrisRecommendation();
    updateUI();
  }

  function hardDropTetris() {
    state.tetris.active.y = ghostY(state.tetris.active);
    lockTetris();
  }

  function holdTetris() {
    const t = state.tetris;
    if (t.heldThisTurn) return;
    const current = t.active.type;
    if (t.hold) {
      const swap = t.hold; t.hold = current; spawnTetris(swap);
    } else {
      t.hold = current; spawnTetris();
    }
    t.heldThisTurn = true;
    updateUI();
  }

  function lessonTetrisTarget(beforeLock = false) {
    const lesson = activeLesson();
    const plan = PLAN_LIBRARY[lesson.id] || PLAN_LIBRARY.tki;
    const index = Math.min(state.step, plan.length - 1);
    const type = beforeLock ? state.tetris.active.type : (lesson.sequence[index] || state.tetris.active.type);
    const [xRaw, rotation] = plan[index];
    const coords = shape(type, rotation);
    const maxX = Math.max(...coords.map(p => p[0]));
    const x = Math.max(0, Math.min(9 - maxX, xRaw));
    const probe = { type, x, y: 0, rotation };
    return { ...probe, y: ghostY(probe) };
  }

  function scoreTetrisPlacement(type, x, rotation) {
    const board = state.tetris.board.map(r => [...r]);
    const probe = { type, x, y: 0, rotation };
    if (shape(type, rotation).some(([sx]) => x + sx >= 10)) return null;
    const y = ghostY(probe, board);
    for (const [sx,sy] of shape(type, rotation)) {
      const yy = y + sy;
      if (yy < 0 || yy >= 22 || x + sx < 0 || x + sx >= 10) return null;
      board[yy][x + sx] = type;
    }
    const full = board.filter(r => r.every(Boolean)).length;
    const heights = [];
    let holes = 0;
    for (let cx = 0; cx < 10; cx++) {
      let first = 22;
      for (let cy = 0; cy < 22; cy++) if (board[cy][cx]) { first = cy; break; }
      heights.push(22 - first);
      for (let cy = first; cy < 22; cy++) if (!board[cy][cx]) holes++;
    }
    const bumpiness = heights.slice(1).reduce((sum,h,i) => sum + Math.abs(h - heights[i]), 0);
    const maxHeight = Math.max(...heights);
    return { score: full * 12 - holes * 18 - bumpiness * 1.4 - maxHeight * .8, x, y, rotation, type };
  }

  function bestTetrisPlacement() {
    const type = state.tetris.active.type;
    let best = null;
    for (let r = 0; r < 4; r++) {
      const width = Math.max(...shape(type,r).map(p => p[0])) + 1;
      for (let x = 0; x <= 10 - width; x++) {
        const candidate = scoreTetrisPlacement(type,x,r);
        if (candidate && (!best || candidate.score > best.score)) best = candidate;
      }
    }
    return best;
  }

  function updateTetrisRecommendation() {
    const q = [state.tetris.active.type, ...state.tetris.queue.slice(0,6)].join("");
    if (state.tetris.lines > 0 || state.tetris.board.some(r => r.some(Boolean))) state.recommendation = "Clean 6–3 stack";
    else if (q.indexOf("I") < 4) state.recommendation = "TKI opportunity";
    else if (q.indexOf("O") < 3) state.recommendation = "Perfect Clear base";
    else if (q.indexOf("L") < 3 || q.indexOf("J") < 3) state.recommendation = "MKO-style foundation";
    else state.recommendation = "Flat stack into a TSD";
  }

  function initPuyo() {
    const lesson = activeLesson();
    const pairs = [];
    if (state.mode === "lesson") {
      const colors = lesson.colors;
      for (let i = 0; i < colors.length; i += 2) pairs.push([colors[i], colors[i+1]]);
    }
    while (pairs.length < 8) pairs.push(randomPuyoPair());
    state.puyo = { board: emptyBoard(6,13), queue: pairs, active: null, chains: 0 };
    spawnPuyo();
    if (state.mode === "play") updatePuyoRecommendation();
  }

  function randomPuyoPair() {
    const colors = Object.keys(PUYO_COLORS);
    return [colors[Math.floor(Math.random()*4)], colors[Math.floor(Math.random()*4)]];
  }

  function spawnPuyo() {
    const p = state.puyo;
    while (p.queue.length < 7) p.queue.push(randomPuyoPair());
    p.active = { colors: p.queue.shift(), x: 2, y: 1, rotation: 0 };
    updateCoach();
  }

  function puyoOffsets(rotation) {
    return [[0,-1],[1,0],[0,1],[-1,0]][((rotation%4)+4)%4];
  }

  function puyoCells(pair, x = pair.x, y = pair.y, rotation = pair.rotation) {
    const [dx,dy] = puyoOffsets(rotation);
    return [[x,y,pair.colors[0]],[x+dx,y+dy,pair.colors[1]]];
  }

  function collidesPuyo(pair, dx = 0, dy = 0, rotation = pair.rotation) {
    return puyoCells(pair, pair.x+dx, pair.y+dy, rotation).some(([x,y]) => x < 0 || x >= 6 || y >= 13 || (y >= 0 && state.puyo.board[y][x]));
  }

  function movePuyo(dx,dy) {
    if (!collidesPuyo(state.puyo.active,dx,dy)) { state.puyo.active.x += dx; state.puyo.active.y += dy; return true; }
    return false;
  }

  function rotatePuyo(direction) {
    const pair = state.puyo.active, next = (pair.rotation + direction + 4) % 4;
    for (const dx of [0,-1,1]) if (!collidesPuyo(pair,dx,0,next)) { pair.x += dx; pair.rotation = next; return; }
  }

  function puyoGhost(pair) {
    let y = pair.y;
    while (!puyoCells(pair,pair.x,y+1,pair.rotation).some(([x,yy]) => x < 0 || x >= 6 || yy >= 13 || (yy >= 0 && state.puyo.board[yy][x]))) y++;
    return y;
  }

  function lockPuyo() {
    const p = state.puyo, pair = p.active;
    const expectedTarget = state.mode === "lesson" ? lessonPuyoTarget() : null;
    snapshot();
    const landed = { x: pair.x, y: pair.y, rotation: pair.rotation };
    const cells = puyoCells(pair).sort((a,b) => b[1] - a[1]);
    for (const [x,initialY,color] of cells) {
      let y = Math.max(0, initialY);
      while (y + 1 < 13 && !p.board[y+1][x]) y++;
      p.board[y][x] = color;
    }
    resolvePuyoChains();
    if (state.mode === "lesson") {
      const target = expectedTarget;
      const correct = target && landed.x === target.x && landed.rotation === target.rotation;
      if (correct) { state.step++; state.warning = ""; showToast("Good placement"); }
      else { state.warning = "That pair changes the taught sequence. Undo to retry the highlighted placement."; showToast("Different placement — undo is available"); }
    }
    spawnPuyo();
    if (state.mode === "play") updatePuyoRecommendation();
    updateUI();
  }

  function resolvePuyoChains() {
    const board = state.puyo.board;
    let chain = 0;
    while (true) {
      const remove = new Set();
      const seen = new Set();
      for (let y=0;y<13;y++) for (let x=0;x<6;x++) {
        const color = board[y][x], key = `${x},${y}`;
        if (!color || seen.has(key)) continue;
        const group = [], stack = [[x,y]]; seen.add(key);
        while (stack.length) {
          const [cx,cy] = stack.pop(); group.push([cx,cy]);
          for (const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]) {
            const nk = `${nx},${ny}`;
            if (nx>=0&&nx<6&&ny>=0&&ny<13&&!seen.has(nk)&&board[ny][nx]===color) { seen.add(nk); stack.push([nx,ny]); }
          }
        }
        if (group.length >= 4) group.forEach(([gx,gy]) => remove.add(`${gx},${gy}`));
      }
      if (!remove.size) break;
      chain++;
      remove.forEach(key => { const [x,y] = key.split(",").map(Number); board[y][x] = null; });
      for (let x=0;x<6;x++) {
        const values = [];
        for (let y=12;y>=0;y--) if (board[y][x]) values.push(board[y][x]);
        for (let y=12,i=0;y>=0;y--,i++) board[y][x] = values[i] || null;
      }
    }
    if (chain) { state.puyo.chains = Math.max(state.puyo.chains,chain); showToast(`${chain}-chain!`); }
  }

  function hardDropPuyo() { state.puyo.active.y = puyoGhost(state.puyo.active); lockPuyo(); }

  function lessonPuyoTarget() {
    const plan = PUYO_PLANS[activeLesson().id] || PUYO_PLANS.gtr;
    const [x,rotation] = plan[Math.min(state.step,plan.length-1)];
    const probe = { ...state.puyo.active, x, rotation, y: 1 };
    return { x, rotation, y: puyoGhost(probe) };
  }

  function bestPuyoPlacement() {
    let best = null;
    for (let r=0;r<4;r++) for (let x=0;x<6;x++) {
      const probe = { ...state.puyo.active, x, y:1, rotation:r };
      if (collidesPuyo(probe,0,0,r)) continue;
      const y = puyoGhost(probe);
      const cells = puyoCells(probe,x,y,r);
      let adjacency = 0, heightPenalty = 0;
      for (const [cx,cy,color] of cells) {
        heightPenalty += (13-cy) * .2;
        for (const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]) if (ny>=0&&ny<13&&nx>=0&&nx<6&&state.puyo.board[ny][nx]===color) adjacency += 3;
      }
      const edgeBonus = x < 3 ? .5 : 0;
      const score = adjacency + edgeBonus - heightPenalty;
      if (!best || score > best.score) best = { x,y,rotation:r,score };
    }
    return best || { x:2,y:puyoGhost(state.puyo.active),rotation:0 };
  }

  function updatePuyoRecommendation() {
    const [a,b] = state.puyo.active.colors;
    if (a === b) state.recommendation = "Start a Stairs base";
    else if (state.puyo.board.every(r => r.every(v => !v))) state.recommendation = "Start a GTR transition";
    else state.recommendation = "Extend cleanly to the right";
  }

  function undo() {
    if (!state.undo || state.undo.game !== state.game) return;
    state.mode = state.undo.mode; state.lessonIndex = state.undo.lessonIndex; state.step = state.undo.step;
    state.tetris = state.undo.tetris; state.puyo = state.undo.puyo; state.undo = null; state.warning = "";
    $("#undoButton").disabled = true;
    showToast("Move undone"); updateUI(); updateCoach();
  }

  function resetGame() {
    state.step = 0; state.undo = null; state.warning = ""; state.fallAccumulator = 0;
    $("#undoButton").disabled = true;
    if (state.game === "tetris") initTetris(); else initPuyo();
    updateUI();
  }

  function setGame(game) {
    if (state.game === game) return;
    state.game = game; state.lessonIndex = 0;
    $$(".game-tab").forEach(b => { const active = b.dataset.game === game; b.classList.toggle("active",active); b.setAttribute("aria-selected",active); });
    populateLessons(); resetGame();
  }

  function setMode(mode) {
    state.mode = mode;
    $$(".mode-button").forEach(b => b.classList.toggle("active",b.dataset.mode === mode));
    $(".lesson-picker-wrap").style.opacity = mode === "lesson" ? "1" : ".48";
    $("#lessonPicker").disabled = mode !== "lesson";
    resetGame();
  }

  function populateLessons() {
    const picker = $("#lessonPicker"); picker.innerHTML = "";
    lessons[state.game].forEach((lesson,index) => {
      const option = document.createElement("option"); option.value = index; option.textContent = lesson.name; picker.append(option);
    });
    picker.value = String(state.lessonIndex); updateLessonCard();
  }

  function updateLessonCard() {
    const lesson = activeLesson();
    $("#lessonNumber").textContent = String(state.lessonIndex+1).padStart(2,"0");
    $("#lessonType").textContent = lesson.type.toUpperCase();
    $("#lessonTitle").textContent = lesson.name;
    $("#lessonDescription").textContent = lesson.description;
    $("#lessonCondition").textContent = lesson.condition;
  }

  function updateCoach() {
    const lesson = activeLesson();
    const isTetris = state.game === "tetris";
    const pieceName = isTetris ? `${state.tetris?.active?.type || "—"} TETROMINO` : `${(state.puyo?.active?.colors || []).join(" + ")} PAIR`;
    $("#currentPieceName").textContent = pieceName;
    $("#coachState").textContent = state.warning ? "CHECK MOVE" : "READY";
    $("#coachState").style.color = state.warning ? "#ffd45e" : "#63e59b";
    const step = state.step + 1;
    $("#instructionKicker").textContent = state.mode === "play" ? "LIVE RECOMMENDATION" : `STEP ${step} · ${step <= 2 ? "FOUNDATION" : "BUILD"}`;
    if (state.warning) {
      $("#instructionTitle").textContent = "This changes the formation";
      $("#instructionText").textContent = state.warning;
      $("#placementText").textContent = "Undo, then follow the ghost placement";
    } else if (state.mode === "play") {
      $("#instructionTitle").textContent = state.recommendation || "Keep the stack clean";
      $("#instructionText").textContent = isTetris ? "The hint favors low height, few holes, and a smooth surface." : "The hint favors matching neighbors while protecting space for a larger chain.";
      $("#placementText").textContent = "Ghost marks the cleanest current placement";
    } else {
      const target = isTetris ? lessonTetrisTarget() : lessonPuyoTarget();
      const location = isTetris ? `column ${target.x+1}` : `column ${target.x+1}`;
      $("#instructionTitle").textContent = `${step === 1 ? "Start" : "Continue"} in ${location}`;
      $("#instructionText").textContent = isTetris ? "Match the ghost position and orientation, then hard drop to confirm the step." : "Place this pair on the highlighted column in the shown orientation.";
      $("#placementText").textContent = "Ghost marks the taught sequence";
    }
    $("#whyText").textContent = lesson.focus;
  }

  function updateUI() {
    updateLessonCard(); updateCoach();
    const total = state.game === "tetris" ? activeLesson().sequence.length : activeLesson().colors.length/2;
    $("#stepCounter").textContent = state.mode === "lesson" ? `STEP ${Math.min(state.step+1,total)} / ${total}` : "ADAPTIVE GUIDE";
    $("#modeStatus").textContent = state.mode === "lesson" ? "GUIDED OPENER" : "RANDOM PLAY";
    $("#speedLabel").textContent = state.speed === 0 ? "No automatic fall" : `${state.speed}× thinking time`;
    $("#holdKey").textContent = displayKey(state.keys.hold);
  }

  function displayKey(key) {
    const names = { ArrowLeft:"←",ArrowRight:"→",ArrowDown:"↓",ArrowUp:"↑",Backspace:"BACK",Enter:"ENTER"," ":"SPACE" };
    return names[key] || key.toUpperCase();
  }

  function drawCell(context,x,y,size,color,alpha=1,outline=false) {
    context.save(); context.globalAlpha = alpha;
    if (outline) {
      context.strokeStyle = color; context.lineWidth = Math.max(2,size*.08); context.setLineDash([size*.2,size*.14]);
      context.strokeRect(x+3,y+3,size-6,size-6);
    } else {
      const grad = context.createLinearGradient(x,y,x+size,y+size);
      grad.addColorStop(0,color); grad.addColorStop(1,shade(color,-25));
      context.fillStyle = grad; context.fillRect(x+1,y+1,size-2,size-2);
      context.fillStyle = "rgba(255,255,255,.22)"; context.fillRect(x+3,y+3,size-6,Math.max(2,size*.1));
      context.strokeStyle = "rgba(0,0,0,.22)"; context.strokeRect(x+1.5,y+1.5,size-3,size-3);
    }
    context.restore();
  }

  function shade(hex,amount) {
    const n = parseInt(hex.slice(1),16), r=Math.max(0,Math.min(255,(n>>16)+amount)), g=Math.max(0,Math.min(255,((n>>8)&255)+amount)), b=Math.max(0,Math.min(255,(n&255)+amount));
    return `#${(b|(g<<8)|(r<<16)).toString(16).padStart(6,"0")}`;
  }

  function drawBoardBackground(cols,rows,cell) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const bg = ctx.createLinearGradient(0,0,0,canvas.height); bg.addColorStop(0,"#0a1924"); bg.addColorStop(1,"#06111a");
    ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = "rgba(119,183,207,.09)"; ctx.lineWidth = 1;
    for (let x=0;x<=cols;x++) { ctx.beginPath(); ctx.moveTo(x*cell+.5,0); ctx.lineTo(x*cell+.5,rows*cell); ctx.stroke(); }
    for (let y=0;y<=rows;y++) { ctx.beginPath(); ctx.moveTo(0,y*cell+.5); ctx.lineTo(cols*cell,y*cell+.5); ctx.stroke(); }
  }

  function drawTetris() {
    const cell = 36, t = state.tetris; drawBoardBackground(10,20,cell);
    for (let y=2;y<22;y++) for (let x=0;x<10;x++) if (t.board[y][x]) drawCell(ctx,x*cell,(y-2)*cell,cell,TETRIS_COLORS[t.board[y][x]]);
    const hint = state.mode === "lesson" ? lessonTetrisTarget() : bestTetrisPlacement();
    if (state.showHint && hint && hint.type === t.active.type) {
      for (const [sx,sy] of shape(hint.type,hint.rotation)) if (hint.y+sy>=2) drawCell(ctx,(hint.x+sx)*cell,(hint.y+sy-2)*cell,cell,TETRIS_COLORS[hint.type],.9,true);
    }
    const gy = ghostY(t.active);
    if (!state.showHint) for (const [sx,sy] of shape(t.active.type,t.active.rotation)) if (gy+sy>=2) drawCell(ctx,(t.active.x+sx)*cell,(gy+sy-2)*cell,cell,TETRIS_COLORS[t.active.type],.25,true);
    for (const [x,y] of cellsFor(t.active)) if (y>=2) drawCell(ctx,x*cell,(y-2)*cell,cell,TETRIS_COLORS[t.active.type]);
    drawMiniTetris(holdCtx,t.hold,100,86);
    drawTetrisQueue();
    drawMiniTetris(coachCtx,t.active.type,76,58);
  }

  function drawMiniTetris(context,type,w,h) {
    context.clearRect(0,0,w,h); if (!type) return;
    const coords = shape(type,0), size = Math.min(20,(w-14)/4), minX=Math.min(...coords.map(p=>p[0])), maxX=Math.max(...coords.map(p=>p[0])), minY=Math.min(...coords.map(p=>p[1])), maxY=Math.max(...coords.map(p=>p[1]));
    const ox=(w-(maxX-minX+1)*size)/2-minX*size, oy=(h-(maxY-minY+1)*size)/2-minY*size;
    coords.forEach(([x,y])=>drawCell(context,ox+x*size,oy+y*size,size,TETRIS_COLORS[type]));
  }

  function drawTetrisQueue() {
    const w=100,h=300; nextCtx.clearRect(0,0,w,h);
    state.tetris.queue.slice(0,5).forEach((type,i)=>{
      nextCtx.save(); nextCtx.translate(0,i*58); drawMiniTetris(nextCtx,type,w,56); nextCtx.restore();
      if(i<4){nextCtx.strokeStyle="rgba(151,207,229,.09)";nextCtx.beginPath();nextCtx.moveTo(8,(i+1)*58);nextCtx.lineTo(92,(i+1)*58);nextCtx.stroke();}
    });
  }

  function drawPuyoCircle(context,cx,cy,r,color,alpha=1,outline=false) {
    context.save(); context.globalAlpha=alpha; context.beginPath(); context.arc(cx,cy,r-2,0,Math.PI*2);
    if(outline){context.strokeStyle=color;context.lineWidth=3;context.setLineDash([5,4]);context.stroke();}
    else {const g=context.createRadialGradient(cx-r*.35,cy-r*.4,2,cx,cy,r);g.addColorStop(0,"#fff");g.addColorStop(.18,color);g.addColorStop(1,shade(color,-28));context.fillStyle=g;context.fill();context.fillStyle="rgba(4,15,22,.58)";context.beginPath();context.arc(cx-r*.23,cy-r*.08,r*.09,0,Math.PI*2);context.arc(cx+r*.23,cy-r*.08,r*.09,0,Math.PI*2);context.fill();}
    context.restore();
  }

  function drawPuyo() {
    const p=state.puyo, cell=60; drawBoardBackground(6,12,cell);
    for(let y=1;y<13;y++)for(let x=0;x<6;x++)if(p.board[y][x])drawPuyoCircle(ctx,x*cell+cell/2,(y-1)*cell+cell/2,cell*.46,PUYO_COLORS[p.board[y][x]]);
    const hint=state.mode==="lesson"?lessonPuyoTarget():bestPuyoPlacement();
    if(state.showHint&&hint){const probe={...p.active,x:hint.x,y:hint.y,rotation:hint.rotation};puyoCells(probe).forEach(([x,y,c])=>{if(y>=1)drawPuyoCircle(ctx,x*cell+cell/2,(y-1)*cell+cell/2,cell*.45,PUYO_COLORS[c],.9,true);});}
    puyoCells(p.active).forEach(([x,y,c])=>{if(y>=1)drawPuyoCircle(ctx,x*cell+cell/2,(y-1)*cell+cell/2,cell*.46,PUYO_COLORS[c]);});
    drawMiniPuyo(holdCtx,null,100,86);
    drawPuyoQueue(); drawMiniPuyo(coachCtx,p.active.colors,76,58);
  }

  function drawMiniPuyo(context,pair,w,h) {
    context.clearRect(0,0,w,h); if(!pair)return;
    const r=Math.min(18,h*.27); drawPuyoCircle(context,w/2,h/2+r*.72,r,PUYO_COLORS[pair[0]]); drawPuyoCircle(context,w/2,h/2-r*.72,r,PUYO_COLORS[pair[1]]);
  }

  function drawPuyoQueue() {
    nextCtx.clearRect(0,0,100,300); state.puyo.queue.slice(0,5).forEach((pair,i)=>{nextCtx.save();nextCtx.translate(0,i*58);drawMiniPuyo(nextCtx,pair,100,56);nextCtx.restore();});
  }

  function draw() { if(state.game==="tetris"&&state.tetris)drawTetris(); else if(state.puyo)drawPuyo(); }

  function gravityInterval() { return state.speed===0?Infinity:(state.speed===10?2000:1000); }

  function tick(timestamp) {
    const delta=Math.min(50,timestamp-state.lastTime||0); state.lastTime=timestamp;
    if(!state.paused&&state.speed!==0){
      state.fallAccumulator+=delta;
      if(state.fallAccumulator>=gravityInterval()){
        state.fallAccumulator=0;
        const moved=state.game==="tetris"?moveTetris(0,1):movePuyo(0,1);
        if(!moved){
          if(state.game==="tetris"){state.tetris.lockMs+=gravityInterval();if(state.tetris.lockMs>=500)lockTetris();}
          else lockPuyo();
        }
      }
    }
    draw(); requestAnimationFrame(tick);
  }

  function handleAction(action) {
    if(action==="pause"){togglePause();return;}
    if(state.paused)return;
    if(action==="hint"){state.showHint=!state.showHint;$("#hintButton").classList.toggle("active",state.showHint);showToast(state.showHint?"Hint shown":"Hint hidden");return;}
    if(action==="undo"){undo();return;}
    if(state.game==="tetris"){
      if(action==="left")moveTetris(-1,0);if(action==="right")moveTetris(1,0);if(action==="softDrop")moveTetris(0,1);
      if(action==="hardDrop")hardDropTetris();if(action==="rotateCCW")rotateTetris(-1);if(action==="rotateCW")rotateTetris(1);if(action==="hold")holdTetris();
    } else {
      if(action==="left")movePuyo(-1,0);if(action==="right")movePuyo(1,0);if(action==="softDrop")movePuyo(0,1);
      if(action==="hardDrop")hardDropPuyo();if(action==="rotateCCW")rotatePuyo(-1);if(action==="rotateCW")rotatePuyo(1);
    }
  }

  function togglePause() {
    state.paused=!state.paused; $("#pauseOverlay").classList.toggle("visible",state.paused); $("#pauseOverlay").setAttribute("aria-hidden",String(!state.paused));
    $("#pauseButton").firstChild.textContent=state.paused?"▶":"Ⅱ";
  }

  let toastTimer;
  function showToast(message){const el=$("#toast");el.textContent=message;el.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("visible"),1600);}

  function buildKeyGrid() {
    const grid=$("#keyGrid");grid.innerHTML="";
    Object.keys(ACTION_LABELS).forEach(action=>{
      const row=document.createElement("div");row.className="key-row";row.innerHTML=`<span>${ACTION_LABELS[action]}</span><button type="button" data-action="${action}">${displayKey(state.keys[action])}</button>`;grid.append(row);
    });
  }

  let listeningAction=null;
  document.addEventListener("keydown",event=>{
    if(listeningAction){event.preventDefault();state.keys[listeningAction]=event.key.length===1?event.key.toLowerCase():event.key;localStorage.setItem("stackLabKeys",JSON.stringify(state.keys));listeningAction=null;buildKeyGrid();updateUI();return;}
    if($("#settingsDialog").open)return;
    const action=Object.keys(state.keys).find(key=>state.keys[key].toLowerCase()===event.key.toLowerCase());
    if(action){event.preventDefault();handleAction(action);}
  });

  $("#keyGrid").addEventListener("click",event=>{const button=event.target.closest("button[data-action]");if(!button)return;listeningAction=button.dataset.action;button.textContent="Press a key…";button.classList.add("listening");});
  $("#settingsButton").addEventListener("click",()=>{$("#settingsDialog").showModal();buildKeyGrid();});
  $("#resetKeys").addEventListener("click",()=>{state.keys={...DEFAULT_KEYS};localStorage.setItem("stackLabKeys",JSON.stringify(state.keys));buildKeyGrid();updateUI();});
  $$(".game-tab").forEach(button=>button.addEventListener("click",()=>setGame(button.dataset.game)));
  $$(".mode-button").forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.mode)));
  $("#lessonPicker").addEventListener("change",event=>{state.lessonIndex=Number(event.target.value);resetGame();});
  $("#speedPicker").addEventListener("change",event=>{state.speed=Number(event.target.value);state.fallAccumulator=0;updateUI();});
  $("#restartButton").addEventListener("click",resetGame);
  $("#pauseButton").addEventListener("click",togglePause);
  $("#hintButton").addEventListener("click",()=>handleAction("hint"));
  $("#undoButton").addEventListener("click",undo);

  populateLessons(); buildKeyGrid(); resetGame(); requestAnimationFrame(tick); canvas.focus();
})();
