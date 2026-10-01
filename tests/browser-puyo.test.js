"use strict";
// Run with Playwright available in NODE_PATH. No application debug hooks are shipped.
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs"), path=require("node:path"), http=require("node:http");
const root=path.join(__dirname,"../dist");
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(req.url.split("?")[0]);
  const file=path.join(root,name==="/"?"index.html":name);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  try{res.setHeader("Content-Type",file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":"text/html");res.end(fs.readFileSync(file));}
  catch{res.writeHead(404);res.end();}
});
(async()=>{
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const browser=await chromium.launch({headless:true,executablePath:process.env.PUYO_BROWSER});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1100}}), errors=[];
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    page.on("pageerror",error=>errors.push(error.message));
    await page.route("**/app.js*",async route=>{
      let app=fs.readFileSync(path.join(root,"app.js"),"utf8");
      app=app.replace("  renderReferences();","  window.__test = {state,tick,draw,spawnPuyo,hardDropPuyo,resetGame,undo,handleAction};\n  renderReferences();");
      await route.fulfill({contentType:"text/javascript",body:app});
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('[data-game="puyo"]').click();await page.locator('[data-mode="play"]').click();
    await page.locator("#seedInput").fill("42");await page.locator("#applySeed").click();
    const session=()=>page.evaluate(()=>JSON.stringify(window.__test.state.puyo));
    const advance=ms=>page.evaluate(ms=>{
      const raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;
      for(let elapsed=0;elapsed<ms;elapsed+=50)window.__test.tick(window.__test.state.lastTime+Math.min(50,ms-elapsed));
      window.requestAnimationFrame=raf;
    },ms);
    const cursor=()=>page.evaluate(()=>window.__test.state.puyo.generator.cursor);
    const y=()=>page.evaluate(()=>window.__test.state.puyo.active.y);
    const nativeHeight=()=>page.locator("#gameCanvas").evaluate(el=>el.height);
    // Free Play derives 1x policy without modifying the shared lesson speed.
    await page.locator('[data-mode="lesson"]').click();await page.locator("#speedPicker").selectOption("0");
    await page.locator('[data-mode="play"]').click();
    assert.equal(await nativeHeight(),720);
    assert.equal(await page.locator(".speed-card").isVisible(),false);
    assert.equal(await page.locator("#puyoReferences").isVisible(),true);
    assert.equal(await page.evaluate(()=>window.__test.state.speed),0);
    await page.evaluate(()=>window.__test.state.lastTime=performance.now());
    await page.clock.runFor(850);assert.equal(await y(),5,"real animation scheduler falls at 200ms per row");
    await advance(2400);assert.equal(await cursor(),18,"normal automatic locking");
    await page.evaluate(()=>window.__test.undo());assert.equal(await cursor(),16,"automatic lock Undo restores stream");
    assert.equal(await y(),12);await advance(450);assert.equal(await cursor(),16,"Undo grants a fresh lock delay");
    await advance(50);assert.equal(await cursor(),18,"normal 500ms lock delay after Undo");
    await page.locator("#restartButton").click();await page.locator("#gameCanvas").focus();
    await page.keyboard.down("ArrowDown");assert.equal(await y(),2,"Down soft drops immediately");
    await advance(100);assert.equal(await y(),4,"held Down accelerates Free Play");
    await page.keyboard.up("ArrowDown");await page.keyboard.press("ArrowUp");assert.equal(await cursor(),18,"Up hard drops");
    await page.locator("#restartButton").click();
    for(const speed of ["5","10"]){
      await page.locator('[data-mode="lesson"]').click();await page.locator("#speedPicker").selectOption(speed);
      await page.locator('[data-mode="play"]').click();await advance(200);assert.equal(await y(),2,`Free Play overrides ${speed}x thinking time`);
    }
    await page.locator("#restartButton").click();
    const freeInitial=await session();
    await page.locator('[data-mode="freeze"]').click();assert.equal(await session(),freeInitial,"mode switch repeats same seeded stream");
    assert.equal(await nativeHeight(),780);
    const initial=await session();
    await page.locator("#gameCanvas").focus();
    await advance(300000);assert.equal(await session(),initial,"five-minute Freeze idle");
    // Both cells actually render within the 13-row board.
    assert.deepEqual(await page.evaluate(()=>StackLabPuyoRules.cells(window.__test.state.puyo.active).map(([,y])=>y)),[1,0]);
    assert(await page.locator("#gameCanvas").evaluate(el=>{
      const c=el.getContext("2d");return [30,90].every(y=>c.getImageData(150,y,1,1).data[0]>30);
    }),"both spawn cells painted");
    await page.keyboard.down("ArrowDown");const downDropped=await session();assert.equal(await cursor(),18);
    await page.keyboard.down("ArrowDown");await advance(300000);assert.equal(await session(),downDropped,"held/repeated Down hard drops once");
    await page.keyboard.up("ArrowDown");await page.keyboard.press("Backspace");assert.equal(await session(),initial);
    await page.keyboard.press("ArrowLeft");await page.keyboard.press("s");
    const planning=await session();
    await page.keyboard.down("ArrowUp");const dropped=await session();
    await page.keyboard.down("ArrowUp");assert.equal(await session(),dropped,"held hard drop commits once");
    await page.keyboard.up("ArrowUp");await page.keyboard.press("Backspace");assert.equal(await session(),planning);
    await page.keyboard.press("ArrowUp");assert.equal(await session(),dropped,"undo re-drop exact continuation");
    await page.keyboard.press("Backspace");const beforeRepeat=await session();
    await page.evaluate(()=>document.querySelector("#gameCanvas").dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowUp",repeat:true,bubbles:true})));
    assert.equal(await session(),beforeRepeat,"repeat cannot recommit after Undo clears held inputs");
    await page.locator("#restartButton").click();assert.equal(await session(),initial,"seed restart");
    assert.equal(await page.locator("#toast").evaluate(el=>el.classList.contains("visible")),false,"restart clears old status toast");
    await page.locator("#gameCanvas").focus();await page.keyboard.down("ArrowLeft");await page.keyboard.down("ArrowLeft");await page.keyboard.up("ArrowLeft");
    assert.equal(await page.evaluate(()=>window.__test.state.puyo.active.x),0,"horizontal repeat retained");
    await page.locator("#restartButton").click();
    await page.locator("#seedInput").focus();await page.keyboard.press("ArrowUp");assert.equal(await session(),initial,"input focus");
    await page.locator("#seedInput").fill("65536");await page.locator("#applySeed").click();assert(await page.locator("#seedError").innerText());assert.equal(await session(),initial);
    await page.locator("#newSequence").click();assert.equal(await page.evaluate(()=>window.__test.state.puyo.generator.cursor),16);
    // Exact session round trips at both sides of the 256-Puyo boundary.
    for(const cursor of [238,240]){
      await page.evaluate(cursor=>{
        const t=window.__test,p=t.state.puyo;p.board=Array.from({length:13},()=>Array(6).fill(null));
        p.generator=StackLabPuyoRandomizer.create(42);p.generator.cursor=cursor;
        p.active={x:2,y:1,rotation:0,colors:StackLabPuyoRandomizer.nextPair(p.generator)};
        p.queue=Array.from({length:7},()=>StackLabPuyoRandomizer.nextPair(p.generator));p.phase="planning";
      },cursor);
      const before=await session();await page.evaluate(()=>window.__test.hardDropPuyo());const after=await session();
      await page.evaluate(()=>window.__test.undo());assert.equal(await session(),before);
      await page.evaluate(()=>window.__test.hardDropPuyo());assert.equal(await session(),after);
    }
    await page.locator("#restartButton").click();
    await page.evaluate(()=>{const p=window.__test.state.puyo;p.board[0][2]="B";window.__test.spawnPuyo();});
    assert.equal(await page.evaluate(()=>window.__test.state.puyo.phase),"topped-out");
    const topped=await session();await page.locator("#gameCanvas").focus();await page.keyboard.press("ArrowUp");assert.equal(await session(),topped);
    assert.equal(await page.evaluate(()=>window.__test.state.puyo.board[0][2]),"B");
    await page.locator("#restartButton").click();
    // A real drop that blocks the next spawn remains undoable.
    await page.evaluate(()=>{const p=window.__test.state.puyo;for(let y=2;y<13;y++)p.board[y][2]=y%2?"R":"B";});
    const preTop=await session();await page.locator("#gameCanvas").focus();await page.keyboard.press("ArrowUp");
    assert.equal(await page.evaluate(()=>window.__test.state.puyo.phase),"topped-out");
    await page.keyboard.press("Backspace");assert.equal(await session(),preTop);
    await page.locator("#restartButton").click();
    const fixed=await session();
    for(const summary of await page.locator("#puyoReferences summary").all())await summary.click();
    assert.equal(await session(),fixed,"reference interaction is inert");
    await page.locator("#puyoReferences summary").first().focus();await page.keyboard.press("Enter");
    assert.equal(await session(),fixed,"keyboard reference toggle is inert");
    assert.equal(await page.locator("#puyoReferences details").count(),6);
    await page.locator("#settingsButton").click();await page.locator('[data-action="hardDrop"]').click();await page.keyboard.press("d");
    await page.getByRole("button",{name:"Done",exact:true}).click();await page.locator("#gameCanvas").focus();
    await page.keyboard.press("d");assert.notEqual(await session(),fixed,"rebound drop key");
    assert((await page.locator("#instructionText").innerText()).includes("D to hard drop"));
    await page.locator("#restartButton").click();
    await page.locator("#settingsButton").click();await page.locator('[data-action="softDrop"]').click();await page.keyboard.press("f");
    await page.getByRole("button",{name:"Done",exact:true}).click();await page.locator("#gameCanvas").focus();
    await page.keyboard.down("f");assert.equal(await cursor(),18,"rebound Down action hard drops in Freeze");
    await advance(1000);assert.equal(await cursor(),18);await page.keyboard.up("f");
    await page.locator("#settingsButton").click();await page.locator("#resetKeys").click();
    await page.getByRole("button",{name:"Done",exact:true}).click();
    // Mouse/touch down acts once, generated clicks cannot double commit.
    for(const action of ["softDrop","hardDrop"]){
      await page.locator("#restartButton").click();
      const control=page.locator(`[data-puyo-action="${action}"]`);await control.scrollIntoViewIfNeeded();
      const box=await control.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
      await page.mouse.down();assert.equal(await cursor(),18);const pressed=await session();
      await advance(300000);assert.equal(await session(),pressed,"held screen button commits once");
      await page.mouse.up();assert.equal(await session(),pressed,"pointer click does not double commit");
      await control.focus();await page.keyboard.press("Enter");assert.equal(await cursor(),20,"accessible keyboard button activation");
      await page.keyboard.down("Enter");assert.equal(await cursor(),22);
      await page.keyboard.down("Enter");assert.equal(await cursor(),22,"held Enter on screen button commits once");
      await page.keyboard.up("Enter");
    }
    // Wall rotations and ghost placement share unchanged physics.
    await page.locator("#restartButton").click();await page.locator("#gameCanvas").focus();
    await page.keyboard.press("ArrowLeft");await page.keyboard.press("ArrowLeft");await page.keyboard.press("a");
    assert.equal(await page.evaluate(()=>StackLabPuyoRules.collides(window.__test.state.puyo.board,window.__test.state.puyo.active)),false);
    const expectedBoard=await page.evaluate(()=>{const p=window.__test.state.puyo;return StackLabPuyoRules.resolve(StackLabPuyoRules.place(p.board,{...p.active,y:StackLabPuyoRules.landing(p.board,p.active)})).board;});
    await page.keyboard.press("ArrowUp");assert.deepEqual(await page.evaluate(()=>window.__test.state.puyo.board),expectedBoard,"ghost agrees with placement");
    // Both mode branches produce identical full-cycle streams across seeds.
    for(const seed of [0,42,65535]){
      const streams=[];
      for(const mode of ["play","freeze"]){
        await page.locator(`[data-mode="${mode}"]`).click();await page.locator("#seedInput").fill(String(seed));await page.locator("#applySeed").click();
        streams.push(await page.evaluate(()=>{const pairs=[];for(let i=0;i<260;i++){
          const t=window.__test; pairs.push(t.state.puyo.active.colors.slice());t.hardDropPuyo();
          t.state.puyo.board=Array.from({length:13},()=>Array(6).fill(null));
        }return pairs;}));
      }
      assert.deepEqual(streams[0],streams[1]);assert.equal(new Set(streams[0].flat()).size,4);
      assert(new Set(streams[0].slice(0,2).flat()).size<=3);
    }
    await page.locator('[data-mode="play"]').click();await page.locator("#restartButton").click();
    await page.locator("#puyoDown").scrollIntoViewIfNeeded();const downBox=await page.locator("#puyoDown").boundingBox();
    await page.mouse.move(downBox.x+downBox.width/2,downBox.y+downBox.height/2);await page.mouse.down();
    assert.equal(await y(),2);await advance(100);assert.equal(await y(),4);await page.mouse.up();
    assert.equal(await page.locator("#puyoDownLabel").innerText(),"Soft drop");
    await page.locator("#gameCanvas").focus();await page.keyboard.press("Enter");const paused=await session();
    await advance(3000);assert.equal(await session(),paused,"pause stops Free Play");await page.keyboard.press("Enter");
    await advance(200);assert.equal(await y(),5,"resume falls normally");
    await page.keyboard.down("ArrowDown");await page.locator('[data-mode="freeze"]').click();
    await advance(1000);assert.equal(await y(),1);assert.equal(await cursor(),16,"mode change clears held input and timers");
    await page.keyboard.up("ArrowDown");
    await page.locator('[data-game="tetris"]').click();assert.equal(await page.evaluate(()=>window.__test.state.mode),"play");
    assert.equal(await nativeHeight(),720);assert.equal(await page.locator('[data-mode="freeze"]').isVisible(),false);
    assert.equal(await page.locator("#puyoControls").isVisible(),false);
    assert.equal(await page.locator("#speedPicker").inputValue(),"10","shared speed preserved");
    await page.locator('[data-game="puyo"]').click();
    await page.locator('[data-mode="lesson"]').click();assert.equal(await page.locator("#puyoReferences").isVisible(),false);
    assert.equal(await nativeHeight(),720);
    await page.locator("#speedPicker").selectOption("5");
    await page.locator("#gameCanvas").focus();const lessonY=await page.evaluate(()=>window.__test.state.puyo.active.y);
    await page.keyboard.press("ArrowDown");assert.equal(await page.evaluate(()=>window.__test.state.puyo.active.y),lessonY+1);
    await page.evaluate(()=>{const p=window.__test.state.puyo;p.board[0][2]="B";window.__test.spawnPuyo();});
    assert.equal(await page.evaluate(()=>window.__test.state.puyo.phase),"topped-out","lesson blocked spawn remains safe");
    await page.locator('[data-game="tetris"]').click();await page.locator('[data-mode="play"]').click();
    assert.equal(await page.locator("#scoreCard").isVisible(),true);assert.equal(await page.locator("#speedPicker").inputValue(),"5");
    await page.locator('[data-game="puyo"]').click();
    for(const mode of ["play","freeze"]){
    await page.locator(`[data-mode="${mode}"]`).click();
    for(const width of [1440,1120,780,390,320]){
      await page.setViewportSize({width,height:1100});
      const layout=await page.evaluate(()=>{
        const board=document.querySelector("#gameCanvas").getBoundingClientRect(),refs=document.querySelector("#puyoReferences").getBoundingClientRect();
        return {overflow:document.documentElement.scrollWidth>innerWidth,ratio:board.height/board.width,board:{x:board.x,right:board.right,bottom:board.bottom},refs:{x:refs.x,y:refs.y}};
      });
      assert.equal(layout.overflow,false,`${width}px page width`);assert(layout.board.x>=0&&layout.board.right<=width);
      assert(Math.abs(layout.ratio-(mode==="freeze"?13/6:2))<.01,"square cells at every viewport");
      if(width<=1120)assert(layout.refs.y>layout.board.bottom);else assert(layout.refs.x>layout.board.right);
    }
    await page.setViewportSize({width:720,height:550}); // Equivalent CSS viewport at 200% desktop zoom.
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    }
    if(process.env.PUYO_SCREENSHOT){
      await page.evaluate(()=>document.querySelectorAll("#puyoReferences details").forEach((detail,i)=>detail.open=i===0));
      await page.locator("#seedInput").fill("42");await page.locator("#applySeed").click();
      await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>window.__test.draw());await page.screenshot({path:process.env.PUYO_SCREENSHOT,fullPage:true});
      await page.setViewportSize({width:390,height:900});await page.evaluate(()=>window.__test.draw());await page.screenshot({path:process.env.PUYO_SCREENSHOT.replace("desktop","mobile"),fullPage:true});
      await page.locator('[data-mode="play"]').click();await page.evaluate(()=>window.__test.draw());
      await page.screenshot({path:path.join(path.dirname(process.env.PUYO_SCREENSHOT),"free-play-mobile"+path.extname(process.env.PUYO_SCREENSHOT)),fullPage:true});
      await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>window.__test.draw());
      await page.screenshot({path:path.join(path.dirname(process.env.PUYO_SCREENSHOT),"free-play-desktop"+path.extname(process.env.PUYO_SCREENSHOT)),fullPage:true});
    }
    assert.deepEqual(errors,[]);
    // Confirm falling and automatic locking against wall time as well as the controlled clock.
    const live=await browser.newPage();
    live.on("pageerror",error=>errors.push(error.message));
    await live.route("**/app.js*",route=>route.fulfill({contentType:"text/javascript",body:fs.readFileSync(path.join(root,"app.js"),"utf8").replace("  renderReferences();","  window.__test={state};\n  renderReferences();")}));
    await live.goto(`http://127.0.0.1:${server.address().port}`);
    await live.locator('[data-game="puyo"]').click();await live.locator('[data-mode="play"]').click();
    await live.waitForFunction(()=>window.__test.state.puyo.active.y>=3,{},{timeout:2000});
    await live.waitForFunction(()=>window.__test.state.puyo.generator.cursor>=18,{},{timeout:4500});
    await live.close();assert.deepEqual(errors,[]);
    console.log("Browser checks passed: timed 1x Free Play/locking, five-minute Freeze idle, both drop inputs/buttons, repeat/focus, undo/re-drop, full-cycle determinism, top-out, seeds, references, rebinding, transitions, 12/13 rows, 320–1440px and zoom viewport.");
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
