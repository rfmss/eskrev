const { chromium } = require("playwright");
const path = require("path");
const OUT = path.join(__dirname);

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 120 });
  const pg = await browser.newPage();
  await pg.setViewportSize({ width: 1280, height: 800 });
  await pg.goto("http://localhost:3000/onep.html", { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(1500);

  const shot = async (name) => pg.screenshot({ path: path.join(OUT, name + ".png"), fullPage: false });
  const log  = (msg) => console.log("[" + new Date().toISOString().slice(11, 19) + "] " + msg);

  await pg.click(".pageContent");
  await pg.waitForTimeout(300);

  // ── 1. --h ajuda ─────────────────────────────────────────────────────────
  log("→ --h");
  await pg.keyboard.type("--h", { delay: 80 });
  await pg.waitForTimeout(600);
  const slicesH = await pg.evaluate(() => document.querySelectorAll(".slice").length);
  const hSliceHTML = await pg.evaluate(() => {
    const s = document.querySelector(".slice");
    return s ? s.outerHTML.slice(0, 200) : "nenhum slice";
  });
  log("slices: " + slicesH + " | html: " + hSliceHTML);
  await shot("01_h");

  // ── 2. Digita linha normal ────────────────────────────────────────────────
  await pg.keyboard.press("Enter");
  await pg.keyboard.type("Uma linha de texto normal após o help.", { delay: 30 });
  await pg.waitForTimeout(300);
  await shot("02_typing");

  // ── 3. --n notas ─────────────────────────────────────────────────────────
  log("→ --n");
  await pg.keyboard.press("Enter");
  await pg.keyboard.type("--n", { delay: 80 });
  await pg.waitForTimeout(700);
  const slicesN = await pg.evaluate(() => document.querySelectorAll(".slice").length);
  log("slices após --n: " + slicesN);
  await shot("03_n");

  // clicar dentro do slice de notas
  const notaEl = await pg.$(".slice");
  if (notaEl) {
    await notaEl.click().catch(() => {});
    await pg.waitForTimeout(500);
    await shot("04_nota_click");
    log("clicou no slice");
  }

  // ── 4. ESC fecha ─────────────────────────────────────────────────────────
  await pg.keyboard.press("Escape");
  await pg.waitForTimeout(300);

  // ── 5. --a arquivos ───────────────────────────────────────────────────────
  log("→ --a");
  await pg.click(".pageContent");
  await pg.keyboard.press("End");
  await pg.keyboard.press("Enter");
  await pg.keyboard.type("--a", { delay: 80 });
  await pg.waitForTimeout(700);
  const slicesA = await pg.evaluate(() => document.querySelectorAll(".slice").length);
  log("slices após --a: " + slicesA);
  await shot("05_a");

  // ── 6. Clicar botão FULL ─────────────────────────────────────────────────
  log("→ FULL toggle");
  try {
    await pg.getByText("FULL").click({ timeout: 3000 });
    await pg.waitForTimeout(1500);
    await shot("06_full");
    log("URL após FULL: " + pg.url());
  } catch (e) {
    log("FULL falhou: " + e.message);
  }

  // ── 7. Estado final ───────────────────────────────────────────────────────
  await pg.waitForTimeout(1000);
  const state = await pg.evaluate(() => ({
    url: window.location.href,
    pages: document.querySelectorAll(".pageContent").length,
    slices: document.querySelectorAll(".slice").length,
    bodyClass: document.body.className,
    lsKeys: Object.keys(localStorage),
    lsV2: localStorage.getItem("eskrev:onep:pages:v2"),
  }));
  log("estado final:\n" + JSON.stringify(state, null, 2));
  await shot("07_final");

  await pg.waitForTimeout(12000);
  await browser.close();
})();
