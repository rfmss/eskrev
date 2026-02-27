    const pagesEl = document.getElementById('pages');
    const statusEl = document.getElementById('status');
    const topbarEl = document.querySelector('.topbar');
    const viewportEl = document.querySelector('.viewport');
    const outerScrollEl = document.getElementById('outerScroll');
    const outerScrollSizerEl = document.getElementById('outerScrollSizer');
    const pageFlowRailEl = document.getElementById('pageFlowRail');
    const sliceDockEl = document.getElementById('sliceDockRail');

    const vocab = {
      "doravante": "A partir de agora; daqui em diante.",
      "outrossim": "Além disso; do mesmo modo; igualmente.",
      "amiúde": "Com frequência; muitas vezes.",
      "destarte": "Dessa maneira; portanto.",
      "mormente": "Principalmente; sobretudo.",
    };

    let sliceId = 0;
    let dockAnchorId = 0;
    let syncOuterLock = false;
    let syncInnerLock = false;
    const dockOffsetX = 20;
    const dockOffsetY = 0;
    const flowOffsetY = 0;

    function setStatus(msg){ statusEl.textContent = msg; }


    const THEME_KEY = "eskrev:index2:theme";
    function applyTheme(theme){
      const safe = ["paper","ink","blueprint"].includes(theme) ? theme : "paper";
      document.body.dataset.theme = safe;
      document.querySelectorAll('.chrome .dot[data-theme]').forEach((el)=>{
        el.classList.toggle('is-active', el.dataset.theme === safe);
        el.setAttribute('aria-pressed', el.dataset.theme === safe ? 'true' : 'false');
      });
      return safe;
    }
    function initThemes(){
      let saved = "paper";
      try{ saved = localStorage.getItem(THEME_KEY) || "paper"; }catch(_e){}
      applyTheme(saved);
      document.querySelectorAll('.chrome .dot[data-theme]').forEach((btn)=>{
        btn.addEventListener('click', ()=>{
          const theme = applyTheme(btn.dataset.theme || "paper");
          try{ localStorage.setItem(THEME_KEY, theme); }catch(_e){}
        });
      });
    }

    function fitTopbar(){
      if(!topbarEl) return;
      topbarEl.style.setProperty('--topbar-scale', '1');
      const usable = Math.max(1, topbarEl.clientWidth - 4);
      const needed = Math.max(1, topbarEl.scrollWidth);
      const scale = needed > usable ? Math.max(0.72, usable / needed) : 1;
      topbarEl.style.setProperty('--topbar-scale', String(scale));
    }

    function positionSliceDockRail(){
      if(!sliceDockEl || !viewportEl) return;
      const page = document.querySelector('.page');
      if(!page){
        sliceDockEl.style.display = 'none';
        return;
      }
      const content = page.querySelector('.pageContent');
      if(!content){
        sliceDockEl.style.display = 'none';
        return;
      }
      const viewportRect = viewportEl.getBoundingClientRect();
      const pageRect = page.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const left = Math.round(pageRect.right - viewportRect.left + dockOffsetX);
      const top = Math.round(contentRect.top - viewportRect.top + dockOffsetY);
      const height = Math.max(0, Math.round(contentRect.height));
      sliceDockEl.style.display = 'block';
      sliceDockEl.style.left = `${left}px`;
      sliceDockEl.style.top = `${top}px`;
      sliceDockEl.style.height = `${height}px`;
    }

    function positionPageFlowRail(contentEl){
      if(!pageFlowRailEl || !viewportEl || !contentEl) return;
      const page = contentEl.closest('.page');
      if(!page){
        pageFlowRailEl.style.display = 'none';
        return;
      }
      const cs = getComputedStyle(contentEl);
      const padTop = parseFloat(cs.paddingTop) || 0;
      const padBottom = parseFloat(cs.paddingBottom) || 0;
      const padLeft = parseFloat(cs.paddingLeft) || 0;
      const viewportRect = viewportEl.getBoundingClientRect();
      const pageRect = page.getBoundingClientRect();
      const left = Math.round(pageRect.left - viewportRect.left + padLeft);
      const top = Math.round(pageRect.top - viewportRect.top + padTop + flowOffsetY);
      const height = Math.max(0, Math.round(pageRect.height - padTop - padBottom - flowOffsetY));
      pageFlowRailEl.style.display = 'block';
      pageFlowRailEl.style.left = `${left}px`;
      pageFlowRailEl.style.top = `${top}px`;
      pageFlowRailEl.style.height = `${height}px`;
    }

    function getDockTagBounds(tag){
      const dock = tag.parentElement;
      const dockHeight = dock ? dock.clientHeight : 0;
      // With transform-origin: top right + rotate(90deg), the visual box extends UP by its own rotated height.
      // So top clamp must include this upward protrusion.
      const visualHeight = Math.max(18, Math.ceil(tag.getBoundingClientRect().height || tag.offsetWidth || 108));
      const edgeGap = 3; // keep 3px breathing room from top and bottom of pageContent rail
      const minTop = visualHeight + edgeGap;
      const maxTop = Math.max(minTop, dockHeight - edgeGap);
      return { minTop, maxTop };
    }

    function positionDockTag(tag){
      const hasManualTop = Object.prototype.hasOwnProperty.call(tag.dataset, 'manualTop');
      const manualTop = Number(tag.dataset.manualTop);
      if(hasManualTop && Number.isFinite(manualTop)){
        const { minTop, maxTop } = getDockTagBounds(tag);
        const clamped = Math.min(Math.max(minTop, manualTop), maxTop);
        tag.style.top = `${Math.round(clamped)}px`;
        return;
      }

      const anchorId = tag.dataset.anchorId;
      if(!anchorId) return;
      const anchor = document.getElementById(anchorId);
      if(!anchor) return;
      const page = anchor.closest('.page');
      if(!page) return;
      const content = page.querySelector('.pageContent');
      const contentRect = content ? content.getBoundingClientRect() : page.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const top = Math.round(anchorRect.top - contentRect.top + 2);
      const { minTop, maxTop } = getDockTagBounds(tag);
      const clamped = Math.min(Math.max(minTop, top), maxTop);
      tag.style.top = `${clamped}px`;
    }

    function refreshDockTags(){
      document.querySelectorAll('.sliceTag[data-anchor-id]').forEach((tag) => {
        positionDockTag(tag);
      });
    }

    function syncOuterScrollerMetric(contentEl){
      if(!outerScrollEl || !outerScrollSizerEl || !contentEl) return;
      const maxInner = Math.max(0, contentEl.scrollHeight - contentEl.clientHeight);
      const targetHeight = outerScrollEl.clientHeight + maxInner;
      outerScrollSizerEl.style.height = `${Math.max(outerScrollEl.clientHeight, targetHeight)}px`;
    }

    function syncOuterScrollerFromContent(contentEl){
      if(!outerScrollEl || !contentEl || syncInnerLock) return;
      syncOuterLock = true;
      outerScrollEl.scrollTop = contentEl.scrollTop;
      syncOuterLock = false;
    }

    function syncFlowPageMarkers(contentEl, { allowGrowth = true } = {}){
      const page = contentEl.closest('.page');
      if(!page) return;
      const layer = pageFlowRailEl || page.querySelector('.pageFlowMarkers');
      if(!layer) return;

      const cs = getComputedStyle(contentEl);
      const padTop = parseFloat(cs.paddingTop) || 0;
      const padBottom = parseFloat(cs.paddingBottom) || 0;
      const padLeft = parseFloat(cs.paddingLeft) || 0;

      positionPageFlowRail(contentEl);
      const liveMetric = Math.max(1, contentEl.clientHeight - padTop - padBottom); // writable area height
      const metric = Number(contentEl.dataset.pageMetric || "0") || liveMetric;
      if(!contentEl.dataset.pageMetric){
        contentEl.dataset.pageMetric = String(metric); // lock metric to avoid resize/zoom marker jumps
      }
      const totalRaw = Math.max(metric, contentEl.scrollHeight - padTop - padBottom);
      const total = Math.max(metric, totalRaw);
      const eps = 2; // avoid phantom extra page by rounding noise
      const adjustedTotal = Math.max(metric, total - eps);
      const stableCount = Math.max(1, Math.ceil(adjustedTotal / metric));
      const prevMax = Number(contentEl.dataset.maxPagesSeen || "1");
      const maxSeen = allowGrowth ? Math.max(prevMax, stableCount) : prevMax;
      contentEl.dataset.maxPagesSeen = String(maxSeen);
      const slot = 16; // fixed marker slots; compact like reference
      const bornTop = Number(layer.dataset.bornTop || "0") || 2; // start from top of page/rail
      if(!layer.dataset.bornTop){
        layer.dataset.bornTop = String(bornTop);
      }

      for(let i = 1; i <= maxSeen; i += 1){
        const id = `pg-${i}`;
        let tag = layer.querySelector(`.flowMarker[data-id="${id}"]`);
        if(!tag){
          tag = document.createElement('span');
          tag.className = 'flowMarker';
          tag.dataset.id = id;
          tag.textContent = `PG${String(i).padStart(2, '0')}`;
          layer.appendChild(tag);
        }

        // Fixed in content coordinates; moves with scroll.
        const anchorY = bornTop + ((i - 1) * metric);
        const y = anchorY - contentEl.scrollTop;
        const layerHeight = layer.clientHeight || page.clientHeight;
        const visible = y > -14 && y < (layerHeight - 2);
        tag.style.top = `${Math.round(y)}px`;
        tag.style.opacity = visible ? ".82" : "0";
      }
    }

    function resetFlowMarkerState(contentEl){
      const page = contentEl.closest('.page');
      if(!page) return;
      const layer = pageFlowRailEl || page.querySelector('.pageFlowMarkers');
      if(!layer) return;
      layer.innerHTML = "";
      delete layer.dataset.bornTop;
      delete contentEl.dataset.pageMetric;
      delete contentEl.dataset.maxPagesSeen;
    }

    function currentPageEditable(){
      // activeElement may be a pageContent div
      const ae = document.activeElement;
      if(ae && ae.classList && ae.classList.contains('pageContent')) return ae;
      // fallback: first page
      return document.querySelector('.pageContent');
    }

    function getSelectionRange(){
      const sel = window.getSelection();
      if(!sel || sel.rangeCount === 0) return null;
      return sel.getRangeAt(0);
    }

    function getTextBeforeCaretWithin(el){
      const range = getSelectionRange();
      if(!range) return "";
      // ensure selection inside this el
      if(!el.contains(range.endContainer)) return "";
      const pre = range.cloneRange();
      pre.selectNodeContents(el);
      pre.setEnd(range.endContainer, range.endOffset);
      return pre.toString();
    }

    function deleteCharsBeforeCaretWithin(el, n){
      const range = getSelectionRange();
      if(!range) return;
      if(!el.contains(range.startContainer)) return;

      const pre = range.cloneRange();
      pre.collapse(true);

      let remaining = n;

      function prevTextNode(node){
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        let prev = null;
        while(walker.nextNode()){
          if(walker.currentNode === node) return prev;
          prev = walker.currentNode;
        }
        return prev;
      }

      let node = pre.startContainer;
      let offset = pre.startOffset;

      if(node.nodeType !== Node.TEXT_NODE){
        // find last text node
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        let last = null;
        while(walker.nextNode()) last = walker.currentNode;
        if(!last) return;
        node = last;
        offset = last.textContent.length;
      }

      while(remaining > 0 && node){
        const take = Math.min(remaining, offset);
        const start = offset - take;

        const del = document.createRange();
        del.setStart(node, start);
        del.setEnd(node, offset);
        del.deleteContents();

        remaining -= take;
        if(remaining <= 0) break;

        node = prevTextNode(node);
        offset = node ? node.textContent.length : 0;
      }
    }

    function insertNodeAtCaret(node){
      const range = getSelectionRange();
      if(!range) return;
      range.collapse(false);
      range.insertNode(node);

      // move caret after
      const sel = window.getSelection();
      const after = document.createRange();
      after.setStartAfter(node);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    }

    function insertTextAtCaret(text){
      const range = getSelectionRange();
      if(!range) return;
      range.deleteContents();
      const node = document.createTextNode(text);
      range.insertNode(node);
      const sel = window.getSelection();
      const after = document.createRange();
      after.setStartAfter(node);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    }

    function escapeHtml(s){
      return String(s ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }

    function makeSlice({badge, title, kind, kindKey, meta, body, debug}){
      const root = document.createElement('div');
      root.className = 'slice isEntering';
      root.setAttribute('contenteditable', 'false');
      root.dataset.sliceId = String(++sliceId);
      root.dataset.kind = kindKey || 'unknown';

      root.innerHTML = `
        <div class="sliceRow">
          <div class="sliceTopHandle" title="Minimizar/expandir corte"></div>
          <button class="sliceDockBtn" type="button" title="Enviar para lateral"></button>
          <div class="gutter left" title="Fechar corte"></div>

          <div class="sliceCard">
            <div class="sliceHead">
              <div class="badge"><strong>${escapeHtml(badge)}</strong> <span>${escapeHtml(title)}</span></div>
              <div class="sliceMeta">${escapeHtml(meta || "")}</div>
            </div>
            <div class="sliceBody">
              <div class="panel">
                <div class="panelBody">${escapeHtml(body)}</div>
              </div>
            </div>
          </div>

          <div class="gutter right" title="Fechar corte"></div>
        </div>
      `;

      const closeWithAnimation = () => {
        if(root.classList.contains('isClosing')) return;
        root.classList.add('isClosing');
        const removeNow = () => {
          if(root.parentNode) root.remove();
        };
        root.addEventListener('transitionend', removeNow, { once: true });
        setTimeout(removeNow, 420);
      };

      const dockSlice = () => {
        const page = root.closest('.page');
        const dock = sliceDockEl || document.querySelector('.sliceDock');
        if(!dock) return;
        if(root.classList.contains('isClosing')) return;

        const parent = root.parentNode;
        if(!parent) return;

        const anchor = document.createElement('span');
        anchor.className = 'sliceAnchor';
        anchor.id = `sliceAnchor${++dockAnchorId}`;
        anchor.setAttribute('contenteditable', 'false');
        parent.insertBefore(anchor, root.nextSibling);

        const tag = document.createElement('button');
        tag.type = 'button';
        tag.className = `sliceTag k-${root.dataset.kind || 'unknown'}`;
        tag.textContent = `${badge} ${title}`;
        tag.title = `Reabrir ${title}`;
        tag.dataset.sliceId = root.dataset.sliceId;
        tag.dataset.anchorId = anchor.id;

        let drag = null;
        let moved = false;
        const dragThreshold = 4;
        const stopDrag = () => {
          drag = null;
          tag.classList.remove('isDragging');
        };
        const onPointerMove = (ev) => {
          if(!drag) return;
          const nextTop = drag.startTop + (ev.clientY - drag.startY);
          const { minTop, maxTop } = getDockTagBounds(tag);
          const clampedTop = Math.min(Math.max(minTop, nextTop), maxTop);
          tag.dataset.manualTop = String(clampedTop);
          tag.style.top = `${Math.round(clampedTop)}px`;
          if(Math.abs(ev.clientY - drag.startY) > dragThreshold){
            moved = true;
          }
        };
        const onPointerUp = () => {
          stopDrag();
        };

        tag.addEventListener('pointerdown', (ev) => {
          if(ev.button !== 0) return;
          const currentTop = Number.parseFloat(tag.style.top || "0");
          drag = {
            startY: ev.clientY,
            startTop: Number.isFinite(currentTop) ? currentTop : 0
          };
          moved = false;
          tag.classList.add('isDragging');
          tag.setPointerCapture(ev.pointerId);
          ev.preventDefault();
        });

        tag.addEventListener('pointermove', onPointerMove);
        tag.addEventListener('pointerup', (ev) => {
          onPointerUp();
          try{ tag.releasePointerCapture(ev.pointerId); } catch(_e){}
        });
        tag.addEventListener('pointercancel', onPointerUp);

        tag.addEventListener('click', () => {
          if(moved){
            moved = false;
            return;
          }
          const targetContent = page ? page.querySelector('.pageContent') : document.getElementById('page1');
          if(targetContent){
            targetContent.appendChild(root);
            root.classList.add('isEntering');
            requestAnimationFrame(() => {
              requestAnimationFrame(() => root.classList.remove('isEntering'));
            });
            const anchorEl = document.getElementById(tag.dataset.anchorId || "");
            if(anchorEl) anchorEl.remove();
            tag.remove();
            setStatus(`reopened: ${title}`);
          }
        });

        dock.prepend(tag);
        positionSliceDockRail();
        positionDockTag(tag);
        root.remove();
        setStatus(`docked: ${title}`);
      };

      // top border toggles minimize/expand; side gutters close
      const toggle = () => root.classList.toggle('isMinimized');
      const topHandle = root.querySelector('.sliceTopHandle');
      const dockBtn = root.querySelector('.sliceDockBtn');
      topHandle.addEventListener('click', toggle);
      dockBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        dockSlice();
      });
      root.querySelector('.gutter.left').addEventListener('click', closeWithAnimation);
      root.querySelector('.gutter.right').addEventListener('click', closeWithAnimation);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.remove('isEntering');
        });
      });

      return root;
    }

    function getLastWordBeforeToken(textBeforeCaret, token){
      const idx = textBeforeCaret.lastIndexOf(token);
      if(idx === -1) return "";
      const before = textBeforeCaret.slice(0, idx).trimEnd();
      const m = before.match(/([A-Za-zÀ-ÿ0-9_-]+)\s*$/);
      return m ? m[1] : "";
    }

    function handleCommand(el, cmd, wordOverride){
      const token = `--${cmd}`;
      const textBefore = getTextBeforeCaretWithin(el);
      const word = wordOverride ?? ((cmd === 'd' || cmd === 'c') ? getLastWordBeforeToken(textBefore, token) : "");

      const debug = [
        `command: ${token}`,
        `word: ${word || "(none)"}`,
        `pagination: disabled (infinite scroll)`,
        `top: minimize/expand | gutters: close`
      ].join('\n');

      if(cmd === 'h'){
        return makeSlice({
          badge: "01",
          title: "HELP",
          kind: "Help",
          kindKey: "help",
          meta: "comandos e regras",
          body:
`- palavra --d  → define a palavra anterior
- --v          → vocabulário local
- --c          → consulta local (vocab + texto)
- --h          → ajuda

Topo do corte: minimiza/abre.
Laterais (gutter): fecham o corte.
Você continua escrevendo sempre.`,
          debug
        });
      }

      if(cmd === 'v'){
        const list = Object.entries(vocab).map(([k,v]) => `• ${k} — ${v}`).join('\n');
        return makeSlice({
          badge: "02",
          title: "VOCAB",
          kind: "Vocabulary",
          kindKey: "vocab",
          meta: `${Object.keys(vocab).length} entradas`,
          body: list || "(vazio)",
          debug
        });
      }

      if(cmd === 'd'){
        const w = (word || "").toLowerCase();
        const def = vocab[w] || `Não encontrei definição local para “${word}”.\n\n(Depois ligamos seu dicionário real / base offline.)`;
        return makeSlice({
          badge: "03",
          title: "DEFINE",
          kind: "Definition",
          kindKey: "define",
          meta: word ? `“${word}”` : "nenhuma palavra detectada",
          body: def,
          debug
        });
      }

      if(cmd === 'c'){
        const term = (word || "").trim();
        const docText = (el?.innerText || "").trim();
        const fold = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const needle = fold(term);

        const vocabHits = Object.entries(vocab).filter(([k, v]) => {
          if (!needle) return false;
          return fold(k).includes(needle) || fold(v).includes(needle);
        });

        const docLines = docText.split(/\r?\n/).map((line) => line.trim());
        const docHits = docLines
          .map((line, idx) => ({ line, idx: idx + 1 }))
          .filter((entry) => needle && entry.line && fold(entry.line).includes(needle))
          .slice(0, 6);

        const lines = [];
        if (!term) {
          lines.push("Consulta local: digite uma palavra e use `--c`.");
          lines.push("");
          lines.push("Exemplo: `doravante --c`");
        } else {
          lines.push(`Termo: "${term}"`);
          lines.push(`Vocabulário: ${vocabHits.length} hit(s)`);
          if (vocabHits.length) {
            lines.push("");
            lines.push("No vocabulário:");
            vocabHits.slice(0, 4).forEach(([k, v]) => lines.push(`• ${k} — ${v}`));
          }
          lines.push("");
          lines.push(`No texto atual: ${docHits.length} trecho(s)`);
          if (docHits.length) {
            docHits.forEach((h) => lines.push(`• L${h.idx}: ${h.line}`));
          } else {
            lines.push("• nenhum trecho encontrado");
          }
        }

        return makeSlice({
          badge: "04",
          title: "CONSULT",
          kind: "Consult",
          kindKey: "consult",
          meta: term ? `termo: ${term}` : "termo: (vazio)",
          body: lines.join('\n'),
          debug
        });
      }

      return makeSlice({
        badge: "00",
        title: "UNKNOWN",
        kind: "Error",
        kindKey: "unknown",
        meta: token,
        body: `Não existe handler para ${token}.`,
        debug
      });
    }

    function maybeTriggerCommand(el){
      const textBefore = getTextBeforeCaretWithin(el);
      const m = textBefore.match(/--([a-z])\s*$/i);
      if(!m) return;

      const cmd = (m[1] || "").toLowerCase();
      const token = `--${cmd}`;
      const tokenLen = token.length;
      const word = (cmd === 'd' || cmd === 'c') ? getLastWordBeforeToken(textBefore, token) : "";

      // remove token
      deleteCharsBeforeCaretWithin(el, tokenLen);

      // insert slice
      const sliceNode = handleCommand(el, cmd, word);
      insertNodeAtCaret(sliceNode);

      setStatus(`slice: --${cmd}`);
    }

    // pagination removed: infinite single document

    // ====== wiring ======
    function wirePage(el){
      let t = null;
      resetFlowMarkerState(el);
      el.addEventListener('keydown', (ev) => {
        if(ev.key !== 'Enter') return;
        ev.preventDefault();
        insertTextAtCaret('\n');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
      el.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          maybeTriggerCommand(el);
          syncFlowPageMarkers(el, { allowGrowth: true });
          syncOuterScrollerMetric(el);
          syncOuterScrollerFromContent(el);
        }, 60);
      });
      el.addEventListener('scroll', () => {
        syncFlowPageMarkers(el, { allowGrowth: false });
        syncOuterScrollerMetric(el);
        syncOuterScrollerFromContent(el);
      });
      syncFlowPageMarkers(el, { allowGrowth: true });
      syncOuterScrollerMetric(el);
      syncOuterScrollerFromContent(el);
      positionPageFlowRail(el);
      positionSliceDockRail();
    }

    initThemes();

    // wire first page
    wirePage(document.getElementById('page1'));
    positionSliceDockRail();
    fitTopbar();
    window.addEventListener('resize', fitTopbar);

    if(outerScrollEl){
      outerScrollEl.addEventListener('scroll', () => {
        if(syncOuterLock) return;
        const el = currentPageEditable() || document.getElementById('page1');
        if(!el) return;
        syncInnerLock = true;
        el.scrollTop = outerScrollEl.scrollTop;
        syncInnerLock = false;
        syncFlowPageMarkers(el, { allowGrowth: false });
        refreshDockTags();
      });
    }

    window.addEventListener('resize', () => {
      const el = document.getElementById('page1');
      if(el) positionPageFlowRail(el);
      positionSliceDockRail();
      refreshDockTags();
      if(el){
        syncOuterScrollerMetric(el);
        syncOuterScrollerFromContent(el);
      }
    });

    // focus first page
    document.getElementById('page1').focus();
    setStatus('ready');
    window.__ESKREV_INDEX2_READY__ = true;
