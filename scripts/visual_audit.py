#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import json

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT_ROOT = ROOT / "prints"
STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
OUT_DIR = OUT_ROOT / f"visual_audit_{STAMP}"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BASE = "http://127.0.0.1:4173"
TARGETS = [
    ("index", "/index.html"),
    ("mobile", "/mobile.html"),
    ("verify", "/verify.html"),
    ("totbooks", "/totbooks.html"),
]
VIEWPORTS = [
    ("desktop", {"width": 1440, "height": 900}),
    ("mobile", {"width": 390, "height": 844}),
]


def layout_probe_script():
    return """
() => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const root = document.documentElement;
  const body = document.body;
  const scrollWidth = Math.max(root ? root.scrollWidth : 0, body ? body.scrollWidth : 0);
  const overflow = scrollWidth - vw;

  const nodes = Array.from(document.querySelectorAll('body *'));
  const offscreen = [];
  const ignoreClass = (el, cls) => el.classList && el.classList.contains(cls);
  for (const el of nodes) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    if (ignoreClass(el, 'sheen') || (el.closest && el.closest('.sheen'))) continue;
    if (el.closest && el.closest('.hud') && !document.body.classList.contains('mobile-hud-open')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const outside = r.right > vw + 1 || r.left < -1;
    const onscreenY = r.bottom > 0 && r.top < vh;
    if (outside && onscreenY) {
      offscreen.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: (el.className || '').toString().slice(0, 80),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width)
      });
    }
  }

  return {
    title: document.title,
    viewport: { width: vw, height: vh },
    scrollWidth,
    horizontalOverflowPx: overflow,
    hasHorizontalOverflow: overflow > 1,
    offscreenCount: offscreen.length,
    offscreenSample: offscreen.slice(0, 12),
  };
}
"""


def severity_for(result):
    severe = []
    moderate = []
    if result["errors"]:
        severe.append(f"{len(result['errors'])} JS runtime errors")
    if result["metrics"].get("hasHorizontalOverflow"):
        severe.append(f"horizontal overflow {result['metrics'].get('horizontalOverflowPx')}px")
    off = result["metrics"].get("offscreenCount", 0)
    if off >= 10:
        moderate.append(f"{off} visible elements partially outside viewport")
    elif off > 0:
        moderate.append(f"{off} visible elements outside viewport")

    if severe:
        level = "high"
    elif moderate:
        level = "medium"
    else:
        level = "low"
    return level, severe + moderate


def main():
    runs = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for page_name, path in TARGETS:
            for vp_name, vp in VIEWPORTS:
                context = browser.new_context(viewport=vp)
                page = context.new_page()
                errors = []
                console_errors = []

                page.on("pageerror", lambda e: errors.append(str(e)))
                page.on(
                    "console",
                    lambda m: console_errors.append(m.text)
                    if m.type == "error"
                    else None,
                )

                url = f"{BASE}{path}"
                nav_error = None
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=30000)
                    page.wait_for_timeout(1800)
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(200)
                except Exception as e:
                    nav_error = str(e)

                shot_path = OUT_DIR / f"{page_name}_{vp_name}.png"
                try:
                    page.screenshot(path=str(shot_path), full_page=True)
                except Exception:
                    pass

                metrics = {}
                if nav_error is None:
                    try:
                        metrics = page.evaluate(layout_probe_script())
                    except Exception as e:
                        nav_error = f"metrics error: {e}"

                run = {
                    "page": page_name,
                    "path": path,
                    "viewport": vp_name,
                    "url": url,
                    "screenshot": str(shot_path.relative_to(ROOT)),
                    "nav_error": nav_error,
                    "errors": errors,
                    "console_errors": console_errors,
                    "metrics": metrics,
                }
                level, notes = severity_for(run)
                run["severity"] = level
                run["notes"] = notes
                runs.append(run)
                context.close()
        browser.close()

    report = {
        "generated_at": datetime.now().isoformat(),
        "base_url": BASE,
        "output_dir": str(OUT_DIR.relative_to(ROOT)),
        "runs": runs,
    }

    json_path = OUT_DIR / "report.json"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        f"# Visual Audit {STAMP}",
        "",
        f"- Base URL: `{BASE}`",
        f"- Output: `{OUT_DIR.relative_to(ROOT)}`",
        "",
        "## Findings",
    ]
    for r in runs:
        lines.append(
            f"- [{r['severity'].upper()}] {r['page']} ({r['viewport']}): "
            f"errors={len(r['errors'])}, console_errors={len(r['console_errors'])}, "
            f"overflow={r.get('metrics',{}).get('horizontalOverflowPx','n/a')}px, "
            f"offscreen={r.get('metrics',{}).get('offscreenCount','n/a')} | screenshot `{r['screenshot']}`"
        )
        if r.get("nav_error"):
            lines.append(f"  nav_error: {r['nav_error']}")
        for n in r.get("notes", [])[:3]:
            lines.append(f"  note: {n}")

    md_path = OUT_DIR / "REPORT.md"
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(str(OUT_DIR.relative_to(ROOT)))


if __name__ == "__main__":
    main()
