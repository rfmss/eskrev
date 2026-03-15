// screenshots/capture.js — navega por todas as páginas principais e tira screenshots
const { chromium } = require("playwright");
const path = require("path");

const BASE = "http://localhost:3000";

const PAGES = [
  { name: "onep",     path: "/onep.html",    desc: "Editor one-page" },
  { name: "index",    path: "/index.html",   desc: "Landing / index" },
  { name: "fullm",    path: "/fullm.html",   desc: "Modo desktop completo" },
  { name: "totbooks", path: "/totbooks.html", desc: "Totbooks" },
  { name: "verify",   path: "/verify.html",  desc: "Verificação" },
];

const VIEWPORTS = [
  { name: "mobile",   width: 375,  height: 812 },
  { name: "desktop",  width: 1280, height: 800 },
];

const OUT = path.join(__dirname);

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();

    for (const pg of PAGES) {
      const url = BASE + pg.path;
      console.log(`[${vp.name}] → ${pg.desc} (${url})`);
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15_000 });
        await page.waitForLoadState("load").catch(() => {});
        await page.waitForTimeout(800); // deixa anims estabilizarem
        const file = path.join(OUT, `${pg.name}_${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: false });
        console.log(`   ✓ salvo: ${file}`);
      } catch (e) {
        console.warn(`   ✗ erro em ${url}: ${e.message}`);
      }
    }

    await ctx.close();
  }

  await browser.close();
  console.log("\nPronto! Screenshots em ./screenshots/");
})();
