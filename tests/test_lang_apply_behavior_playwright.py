import os
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
LANG_FILE = ROOT / "src/js/modules/lang.js"
MUST_RUN = os.getenv("RUN_BROWSER_TESTS") == "1"


def _require_or_skip(reason: str):
    if MUST_RUN:
        pytest.fail(
            "Browser tests required but Playwright/Chromium unavailable in this environment. "
            f"Details: {reason}"
        )
    pytest.skip(reason)


def _load_lang_for_browser() -> str:
    source = LANG_FILE.read_text(encoding="utf-8")
    marker = "export const lang ="
    if marker not in source:
        pytest.fail("Could not find 'export const lang =' in src/js/modules/lang.js")
    return source.replace(marker, "window.__LANG__ = ", 1)


def _is_browser_unavailable_error(exc: Exception) -> bool:
    msg = str(exc)
    cls = exc.__class__.__name__
    launch_markers = (
        "BrowserType.launch",
        "Executable doesn't exist",
        "Target page, context or browser has been closed",
        "Failed to launch",
    )
    return cls in {"Error", "TargetClosedError"} or any(marker in msg for marker in launch_markers)


def test_lang_apply_behavior_playwright():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        _require_or_skip("Playwright not installed in this environment")
        return

    lang_script = _load_lang_for_browser()

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content(
                """
                <main>
                  <div id="t1" data-i18n="k_missing">KEEP</div>
                  <div id="t2" data-i18n="k_html"><b>KEEP</b></div>
                  <div id="t3" data-i18n-html="k_html"><b>KEEP</b></div>
                  <button id="b1" data-i18n-title="k_title" title="KEEP_T">BTN</button>
                  <input id="i1" data-i18n-ph="k_ph" placeholder="KEEP_PH" />
                </main>
                """
            )
            page.add_script_tag(content=lang_script)
            page.evaluate(
                """
                () => {
                  window.__LANG__.db = {
                    pt: {
                      lang_label: "PT",
                      k_html: "<em>SAFE</em>",
                      k_title: "Titulo traduzido",
                      k_ph: "Placeholder traduzido"
                    }
                  };
                  window.__LANG__.languages = [{ code: "pt", label: "PT" }];
                  window.__LANG__.current = "pt";
                  window.__LANG__.apply();
                }
                """
            )

            t1 = page.text_content("#t1")
            t2_text = page.text_content("#t2")
            t2_html = page.inner_html("#t2")
            t3_html = page.inner_html("#t3")
            b1_aria = page.get_attribute("#b1", "aria-label")
            b1_title = page.get_attribute("#b1", "title")
            i1_ph = page.get_attribute("#i1", "placeholder")
            browser.close()
    except Exception as exc:
        if _is_browser_unavailable_error(exc):
            _require_or_skip(f"Chromium launch unavailable: {exc}")
            return
        raise

    assert t1 == "KEEP", "missing key should not break and should keep existing text"
    assert t2_text == "<em>SAFE</em>", "[data-i18n] must set text content (no HTML interpretation)"
    assert "<em>SAFE</em>" not in t2_html, "[data-i18n] should not render HTML tags"
    assert t3_html == "<em>SAFE</em>", "[data-i18n-html] should render HTML in opt-in path"
    assert b1_aria == "Titulo traduzido", "[data-i18n-title] should update aria-label"
    assert b1_title is None, "[data-i18n-title] path removes title in current contract"
    assert i1_ph == "Placeholder traduzido", "[data-i18n-ph] should update placeholder"
