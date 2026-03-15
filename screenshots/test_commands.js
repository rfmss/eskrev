const { chromium } = require("playwright");
const path = require("path");
const OUT = path.join(__dirname);

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const pg = await browser.newPage();
  await pg.setViewportSize({ width: 1280, height: 800 });
  await pg.goto("http://localhost:3000/onep.html", { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(1200);

  // limpa localStorage para começar do zero
  await pg.evaluate(() => localStorage.clear());
  await pg.reload({ waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(1000);

  const shot = (name) => pg.screenshot({ path: path.join(OUT, name + ".png"), fullPage: false });
  const log  = (msg) => console.log("[" + new Date().toISOString().slice(11,19) + "] " + msg);
  const countSlices = () => pg.evaluate(() => document.querySelectorAll(".slice").length);
  const sliceKinds  = () => pg.evaluate(() =>
    [...document.querySelectorAll(".slice")].map(s => s.dataset.kind || s.className)
  );

  await pg.click(".pageContent");
  await pg.waitForTimeout(200);

  // ── --h ──────────────────────────────────────────────────────────────────
  log("→ --h");
  await pg.keyboard.type("--h", { delay: 60 });
  await pg.waitForTimeout(500);
  log("slices: " + await countSlices() + " | kinds: " + JSON.stringify(await sliceKinds()));
  await shot("cmd_01_h");

  // ── --n ──────────────────────────────────────────────────────────────────
  log("→ --n");
  await pg.keyboard.press("Enter");
  await pg.keyboard.type("--n", { delay: 60 });
  await pg.waitForTimeout(500);
  log("slices: " + await countSlices() + " | kinds: " + JSON.stringify(await sliceKinds()));
  await shot("cmd_02_n");

  // ── --a ──────────────────────────────────────────────────────────────────
  log("→ --a");
  await pg.keyboard.press("Enter");
  await pg.keyboard.type("--a", { delay: 60 });
  await pg.waitForTimeout(500);
  log("slices: " + await countSlices() + " | kinds: " + JSON.stringify(await sliceKinds()));
  await shot("cmd_03_a");

  // ── fechar slices pelo gutter ─────────────────────────────────────────────
  log("→ fechando slices pelo gutter esquerdo");
  const gutters = await pg.$$(".gutter.left");
  log("gutters encontrados: " + gutters.length);
  for (const g of gutters) {
    await g.click().catch(() => {});
    await pg.waitForTimeout(200);
  }
  await shot("cmd_04_closed");
  log("slices restantes: " + await countSlices());

  // ── minimizar slice pelo topo ─────────────────────────────────────────────
  log("→ re-abrindo --h e minimizando");
  await pg.keyboard.press("Enter");
  await pg.keyboard.type("--h", { delay: 60 });
  await pg.waitForTimeout(500);
  const handle = await pg.$(".sliceTopHandle");
  if (handle) {
    await handle.click();
    await pg.waitForTimeout(400);
    await shot("cmd_05_minimized");
    log("minimizado ok");
  }

  // ── erros no console ──────────────────────────────────────────────────────
  const errors = [];
  pg.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  await pg.waitForTimeout(500);
  if (errors.length) log("ERROS console: " + errors.join(" | "));
  else log("nenhum erro de console");

  await pg.waitForTimeout(8000);
  await browser.close();
})();
