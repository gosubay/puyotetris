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
    page.on("pageerror",error=>errors.push(error.message));
    await page.route("**/app.js*",async route=>{
      let app=fs.readFileSync(path.join(root,"app.js"),"utf8");
      app=app.replace("  renderReferences();","  window.__test = {state,tick,spawnPuyo,hardDropPuyo,resetGame,undo,handleAction};\n  renderReferences();");
      await route.fulfill({contentType:"text/javascript",body:app});
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('[data-game="puyo"]').click();await page.locator('[data-mode="play"]').click();
    await page.locator("#seedInput").fill("42");await page.locator("#applySeed").click();
    const session=()=>page.evaluate(()=>JSON.stringify(window.__test.state.puyo));
    const initial=await session();
    await page.locator("#gameCanvas").focus();
    await page.keyboard.down("ArrowDown");
    await page.evaluate(()=>{
      const raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;
      for(let i=0;i<6000;i++)window.__test.tick(window.__test.state.lastTime+50);
      window.requestAnimationFrame=raf;
    });
    await page.keyboard.up("ArrowDown");assert.equal(await session(),initial,"five-minute idle and held soft drop");
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
    assert((await page.locator("#instructionText").innerText()).includes("D to drop"));
    await page.locator('[data-mode="lesson"]').click();assert.equal(await page.locator("#puyoReferences").isVisible(),false);
    await page.locator("#gameCanvas").focus();const lessonY=await page.evaluate(()=>window.__test.state.puyo.active.y);
    await page.keyboard.press("ArrowDown");assert.equal(await page.evaluate(()=>window.__test.state.puyo.active.y),lessonY+1);
    await page.evaluate(()=>{const p=window.__test.state.puyo;p.board[0][2]="B";window.__test.spawnPuyo();});
    assert.equal(await page.evaluate(()=>window.__test.state.puyo.phase),"topped-out","lesson blocked spawn remains safe");
    await page.locator('[data-game="tetris"]').click();await page.locator('[data-mode="play"]').click();
    assert.equal(await page.locator("#scoreCard").isVisible(),true);assert.equal(await page.locator("#speedPicker").inputValue(),"5");
    await page.locator('[data-game="puyo"]').click();
    for(const width of [1440,1120,780,390,320]){
      await page.setViewportSize({width,height:1100});
      const layout=await page.evaluate(()=>{
        const board=document.querySelector("#gameCanvas").getBoundingClientRect(),refs=document.querySelector("#puyoReferences").getBoundingClientRect();
        return {overflow:document.documentElement.scrollWidth>innerWidth,board:{x:board.x,right:board.right,bottom:board.bottom},refs:{x:refs.x,y:refs.y}};
      });
      assert.equal(layout.overflow,false,`${width}px page width`);assert(layout.board.x>=0&&layout.board.right<=width);
      if(width<=1120)assert(layout.refs.y>layout.board.bottom);else assert(layout.refs.x>layout.board.right);
    }
    await page.setViewportSize({width:720,height:550}); // Equivalent CSS viewport at 200% desktop zoom.
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(process.env.PUYO_SCREENSHOT){
      await page.evaluate(()=>document.querySelectorAll("#puyoReferences details").forEach((detail,i)=>detail.open=i===0));
      await page.locator("#seedInput").fill("42");await page.locator("#applySeed").click();
      await page.setViewportSize({width:1440,height:1100});await page.screenshot({path:process.env.PUYO_SCREENSHOT,fullPage:true});
      await page.setViewportSize({width:390,height:900});await page.screenshot({path:process.env.PUYO_SCREENSHOT.replace("desktop","mobile"),fullPage:true});
    }
    assert.deepEqual(errors,[]);
    console.log("Browser checks passed: five-minute idle, input, repeat, undo/re-drop, rollover, top-out, seeds, references, rebinding, modes, 320–1440px and zoom viewport.");
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
