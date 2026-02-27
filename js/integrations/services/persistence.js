const CONTENT_TEXT_KEY = "eskrev:index2:page1:content";
const CONTENT_HTML_KEY = "eskrev:index2:page1:html";
const DOCK_HTML_KEY = "eskrev:index2:dock:html";
const POSTIT_HTML_KEY = "eskrev:index2:postit:html";
const SCROLL_KEY = "eskrev:index2:page1:scroll";

export function createPersistencePackage(ctx) {
  function restore(el) {
    if (!el) return;
    try {
      const storedHtml = localStorage.getItem(CONTENT_HTML_KEY);
      const storedText = localStorage.getItem(CONTENT_TEXT_KEY);
      if (storedHtml && storedHtml.trim()) {
        el.innerHTML = storedHtml;
      } else if (storedText && storedText.trim()) {
        // backward compatibility with previous text-only persistence
        el.innerText = storedText;
      }
      const scroll = Number(localStorage.getItem(SCROLL_KEY) || "0");
      if (Number.isFinite(scroll) && scroll > 0) {
        el.scrollTop = scroll;
      }

      const dock = ctx?.refs?.sliceDockEl || document.getElementById("sliceDockRail");
      const dockHtml = localStorage.getItem(DOCK_HTML_KEY);
      if (dock && typeof dockHtml === "string") {
        dock.innerHTML = dockHtml;
      }
      const postitLayer = ctx?.refs?.postitLayerEl || document.getElementById("postitLayer");
      const postitHtml = localStorage.getItem(POSTIT_HTML_KEY);
      if (postitLayer && typeof postitHtml === "string") {
        postitLayer.innerHTML = postitHtml;
      }
    } catch (_e) {
      ctx?.setStatus?.("persistência indisponível");
    }
  }

  function bind(el) {
    if (!el) return;
    let timer = null;
    const save = () => {
      try {
        localStorage.setItem(CONTENT_HTML_KEY, el.innerHTML || "");
        localStorage.setItem(CONTENT_TEXT_KEY, el.innerText || "");
        localStorage.setItem(SCROLL_KEY, String(el.scrollTop || 0));
        const dock = ctx?.refs?.sliceDockEl || document.getElementById("sliceDockRail");
        if (dock) localStorage.setItem(DOCK_HTML_KEY, dock.innerHTML || "");
        const postitLayer = ctx?.refs?.postitLayerEl || document.getElementById("postitLayer");
        if (postitLayer) localStorage.setItem(POSTIT_HTML_KEY, postitLayer.innerHTML || "");
      } catch (_e) {}
    };
    el.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(save, 180);
    });
    el.addEventListener("scroll", save);

    const dock = ctx?.refs?.sliceDockEl || document.getElementById("sliceDockRail");
    const postitLayer = ctx?.refs?.postitLayerEl || document.getElementById("postitLayer");
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(save, 120);
    });
    observer.observe(el, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    if (dock) {
      observer.observe(dock, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
      });
    }
    if (postitLayer) {
      observer.observe(postitLayer, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
      });
    }
  }

  function clear(el) {
    try {
      localStorage.removeItem(CONTENT_HTML_KEY);
      localStorage.removeItem(CONTENT_TEXT_KEY);
      localStorage.removeItem(DOCK_HTML_KEY);
      localStorage.removeItem(POSTIT_HTML_KEY);
      localStorage.removeItem(SCROLL_KEY);
    } catch (_e) {}
    if (el) {
      el.innerText = "";
      el.scrollTop = 0;
    }
    const dock = ctx?.refs?.sliceDockEl || document.getElementById("sliceDockRail");
    if (dock) dock.innerHTML = "";
    const postitLayer = ctx?.refs?.postitLayerEl || document.getElementById("postitLayer");
    if (postitLayer) postitLayer.innerHTML = "";
  }

  return { restore, bind, clear };
}
