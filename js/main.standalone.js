function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var pagesEl = document.getElementById('pages');
var statusEl = document.getElementById('status');
var topbarEl = document.querySelector('.topbar');
var viewportEl = document.querySelector('.viewport');
var outerScrollEl = document.getElementById('outerScroll');
var outerScrollSizerEl = document.getElementById('outerScrollSizer');
var pageFlowRailEl = document.getElementById('pageFlowRail');
var sliceDockEl = document.getElementById('sliceDockRail');
var vocab = {
  "doravante": "A partir de agora; daqui em diante.",
  "outrossim": "Além disso; do mesmo modo; igualmente.",
  "amiúde": "Com frequência; muitas vezes.",
  "destarte": "Dessa maneira; portanto.",
  "mormente": "Principalmente; sobretudo."
};
var sliceId = 0;
var dockAnchorId = 0;
var syncOuterLock = false;
var syncInnerLock = false;
var dockOffsetX = 20;
var dockOffsetY = 0;
var flowOffsetY = 0;
function setStatus(msg) {
  statusEl.textContent = msg;
}
var THEME_KEY = "eskrev:index2:theme";
function applyTheme(theme) {
  var safe = ["paper", "ink", "blueprint"].includes(theme) ? theme : "paper";
  document.body.dataset.theme = safe;
  document.querySelectorAll('.chrome .dot[data-theme]').forEach(function (el) {
    el.classList.toggle('is-active', el.dataset.theme === safe);
    el.setAttribute('aria-pressed', el.dataset.theme === safe ? 'true' : 'false');
  });
  return safe;
}
function initThemes() {
  var saved = "paper";
  try {
    saved = localStorage.getItem(THEME_KEY) || "paper";
  } catch (_e) {}
  applyTheme(saved);
  document.querySelectorAll('.chrome .dot[data-theme]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var theme = applyTheme(btn.dataset.theme || "paper");
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (_e) {}
    });
  });
}
function fitTopbar() {
  if (!topbarEl) return;
  topbarEl.style.setProperty('--topbar-scale', '1');
  var usable = Math.max(1, topbarEl.clientWidth - 4);
  var needed = Math.max(1, topbarEl.scrollWidth);
  var scale = needed > usable ? Math.max(0.72, usable / needed) : 1;
  topbarEl.style.setProperty('--topbar-scale', String(scale));
}
function positionSliceDockRail() {
  if (!sliceDockEl || !viewportEl) return;
  var page = document.querySelector('.page');
  if (!page) {
    sliceDockEl.style.display = 'none';
    return;
  }
  var content = page.querySelector('.pageContent');
  if (!content) {
    sliceDockEl.style.display = 'none';
    return;
  }
  var viewportRect = viewportEl.getBoundingClientRect();
  var pageRect = page.getBoundingClientRect();
  var contentRect = content.getBoundingClientRect();
  var left = Math.round(pageRect.right - viewportRect.left + dockOffsetX);
  var top = Math.round(contentRect.top - viewportRect.top + dockOffsetY);
  var height = Math.max(0, Math.round(contentRect.height));
  sliceDockEl.style.display = 'block';
  sliceDockEl.style.left = "".concat(left, "px");
  sliceDockEl.style.top = "".concat(top, "px");
  sliceDockEl.style.height = "".concat(height, "px");
}
function positionPageFlowRail(contentEl) {
  if (!pageFlowRailEl || !viewportEl || !contentEl) return;
  var page = contentEl.closest('.page');
  if (!page) {
    pageFlowRailEl.style.display = 'none';
    return;
  }
  var cs = getComputedStyle(contentEl);
  var padTop = parseFloat(cs.paddingTop) || 0;
  var padBottom = parseFloat(cs.paddingBottom) || 0;
  var padLeft = parseFloat(cs.paddingLeft) || 0;
  var viewportRect = viewportEl.getBoundingClientRect();
  var pageRect = page.getBoundingClientRect();
  var left = Math.round(pageRect.left - viewportRect.left + padLeft);
  var top = Math.round(pageRect.top - viewportRect.top + padTop + flowOffsetY);
  var height = Math.max(0, Math.round(pageRect.height - padTop - padBottom - flowOffsetY));
  pageFlowRailEl.style.display = 'block';
  pageFlowRailEl.style.left = "".concat(left, "px");
  pageFlowRailEl.style.top = "".concat(top, "px");
  pageFlowRailEl.style.height = "".concat(height, "px");
}
function getDockTagBounds(tag) {
  var dock = tag.parentElement;
  var dockHeight = dock ? dock.clientHeight : 0;
  // With transform-origin: top right + rotate(90deg), the visual box extends UP by its own rotated height.
  // So top clamp must include this upward protrusion.
  var visualHeight = Math.max(18, Math.ceil(tag.getBoundingClientRect().height || tag.offsetWidth || 108));
  var edgeGap = 3; // keep 3px breathing room from top and bottom of pageContent rail
  var minTop = visualHeight + edgeGap;
  var maxTop = Math.max(minTop, dockHeight - edgeGap);
  return {
    minTop: minTop,
    maxTop: maxTop
  };
}
function positionDockTag(tag) {
  var hasManualTop = Object.prototype.hasOwnProperty.call(tag.dataset, 'manualTop');
  var manualTop = Number(tag.dataset.manualTop);
  if (hasManualTop && Number.isFinite(manualTop)) {
    var _getDockTagBounds = getDockTagBounds(tag),
      _minTop = _getDockTagBounds.minTop,
      _maxTop = _getDockTagBounds.maxTop;
    var _clamped = Math.min(Math.max(_minTop, manualTop), _maxTop);
    tag.style.top = "".concat(Math.round(_clamped), "px");
    return;
  }
  var anchorId = tag.dataset.anchorId;
  if (!anchorId) return;
  var anchor = document.getElementById(anchorId);
  if (!anchor) return;
  var page = anchor.closest('.page');
  if (!page) return;
  var content = page.querySelector('.pageContent');
  var contentRect = content ? content.getBoundingClientRect() : page.getBoundingClientRect();
  var anchorRect = anchor.getBoundingClientRect();
  var top = Math.round(anchorRect.top - contentRect.top + 2);
  var _getDockTagBounds2 = getDockTagBounds(tag),
    minTop = _getDockTagBounds2.minTop,
    maxTop = _getDockTagBounds2.maxTop;
  var clamped = Math.min(Math.max(minTop, top), maxTop);
  tag.style.top = "".concat(clamped, "px");
}
function refreshDockTags() {
  document.querySelectorAll('.sliceTag[data-anchor-id]').forEach(function (tag) {
    positionDockTag(tag);
  });
}
function syncOuterScrollerMetric(contentEl) {
  if (!outerScrollEl || !outerScrollSizerEl || !contentEl) return;
  var maxInner = Math.max(0, contentEl.scrollHeight - contentEl.clientHeight);
  var targetHeight = outerScrollEl.clientHeight + maxInner;
  outerScrollSizerEl.style.height = "".concat(Math.max(outerScrollEl.clientHeight, targetHeight), "px");
}
function syncOuterScrollerFromContent(contentEl) {
  if (!outerScrollEl || !contentEl || syncInnerLock) return;
  syncOuterLock = true;
  outerScrollEl.scrollTop = contentEl.scrollTop;
  syncOuterLock = false;
}
function syncFlowPageMarkers(contentEl) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref$allowGrowth = _ref.allowGrowth,
    allowGrowth = _ref$allowGrowth === void 0 ? true : _ref$allowGrowth;
  var page = contentEl.closest('.page');
  if (!page) return;
  var layer = pageFlowRailEl || page.querySelector('.pageFlowMarkers');
  if (!layer) return;
  var cs = getComputedStyle(contentEl);
  var padTop = parseFloat(cs.paddingTop) || 0;
  var padBottom = parseFloat(cs.paddingBottom) || 0;
  var padLeft = parseFloat(cs.paddingLeft) || 0;
  positionPageFlowRail(contentEl);
  var liveMetric = Math.max(1, contentEl.clientHeight - padTop - padBottom); // writable area height
  var metric = Number(contentEl.dataset.pageMetric || "0") || liveMetric;
  if (!contentEl.dataset.pageMetric) {
    contentEl.dataset.pageMetric = String(metric); // lock metric to avoid resize/zoom marker jumps
  }
  var totalRaw = Math.max(metric, contentEl.scrollHeight - padTop - padBottom);
  var total = Math.max(metric, totalRaw);
  var eps = 2; // avoid phantom extra page by rounding noise
  var adjustedTotal = Math.max(metric, total - eps);
  var stableCount = Math.max(1, Math.ceil(adjustedTotal / metric));
  var prevMax = Number(contentEl.dataset.maxPagesSeen || "1");
  var maxSeen = allowGrowth ? Math.max(prevMax, stableCount) : prevMax;
  contentEl.dataset.maxPagesSeen = String(maxSeen);
  var slot = 16; // fixed marker slots; compact like reference
  var bornTop = Number(layer.dataset.bornTop || "0") || 2; // start from top of page/rail
  if (!layer.dataset.bornTop) {
    layer.dataset.bornTop = String(bornTop);
  }
  for (var i = 1; i <= maxSeen; i += 1) {
    var id = "pg-".concat(i);
    var tag = layer.querySelector(".flowMarker[data-id=\"".concat(id, "\"]"));
    if (!tag) {
      tag = document.createElement('span');
      tag.className = 'flowMarker';
      tag.dataset.id = id;
      tag.textContent = "PG".concat(String(i).padStart(2, '0'));
      layer.appendChild(tag);
    }

    // Fixed in content coordinates; moves with scroll.
    var anchorY = bornTop + (i - 1) * metric;
    var y = anchorY - contentEl.scrollTop;
    var layerHeight = layer.clientHeight || page.clientHeight;
    var visible = y > -14 && y < layerHeight - 2;
    tag.style.top = "".concat(Math.round(y), "px");
    tag.style.opacity = visible ? ".82" : "0";
  }
}
function resetFlowMarkerState(contentEl) {
  var page = contentEl.closest('.page');
  if (!page) return;
  var layer = pageFlowRailEl || page.querySelector('.pageFlowMarkers');
  if (!layer) return;
  layer.innerHTML = "";
  delete layer.dataset.bornTop;
  delete contentEl.dataset.pageMetric;
  delete contentEl.dataset.maxPagesSeen;
}
function currentPageEditable() {
  // activeElement may be a pageContent div
  var ae = document.activeElement;
  if (ae && ae.classList && ae.classList.contains('pageContent')) return ae;
  // fallback: first page
  return document.querySelector('.pageContent');
}
function getSelectionRange() {
  var sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  return sel.getRangeAt(0);
}
function getTextBeforeCaretWithin(el) {
  var range = getSelectionRange();
  if (!range) return "";
  // ensure selection inside this el
  if (!el.contains(range.endContainer)) return "";
  var pre = range.cloneRange();
  pre.selectNodeContents(el);
  pre.setEnd(range.endContainer, range.endOffset);
  return pre.toString();
}
function deleteCharsBeforeCaretWithin(el, n) {
  var range = getSelectionRange();
  if (!range) return;
  if (!el.contains(range.startContainer)) return;
  var pre = range.cloneRange();
  pre.collapse(true);
  var remaining = n;
  function prevTextNode(node) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var prev = null;
    while (walker.nextNode()) {
      if (walker.currentNode === node) return prev;
      prev = walker.currentNode;
    }
    return prev;
  }
  var node = pre.startContainer;
  var offset = pre.startOffset;
  if (node.nodeType !== Node.TEXT_NODE) {
    // find last text node
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var last = null;
    while (walker.nextNode()) last = walker.currentNode;
    if (!last) return;
    node = last;
    offset = last.textContent.length;
  }
  while (remaining > 0 && node) {
    var take = Math.min(remaining, offset);
    var start = offset - take;
    var del = document.createRange();
    del.setStart(node, start);
    del.setEnd(node, offset);
    del.deleteContents();
    remaining -= take;
    if (remaining <= 0) break;
    node = prevTextNode(node);
    offset = node ? node.textContent.length : 0;
  }
}
function insertNodeAtCaret(node) {
  var range = getSelectionRange();
  if (!range) return;
  range.collapse(false);
  range.insertNode(node);

  // move caret after
  var sel = window.getSelection();
  var after = document.createRange();
  after.setStartAfter(node);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);
}
function insertTextAtCaret(text) {
  var range = getSelectionRange();
  if (!range) return;
  range.deleteContents();
  var node = document.createTextNode(text);
  range.insertNode(node);
  var sel = window.getSelection();
  var after = document.createRange();
  after.setStartAfter(node);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);
}
function escapeHtml(s) {
  return String(s !== null && s !== void 0 ? s : "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function makeSlice(_ref2) {
  var badge = _ref2.badge,
    title = _ref2.title,
    kind = _ref2.kind,
    kindKey = _ref2.kindKey,
    meta = _ref2.meta,
    body = _ref2.body,
    debug = _ref2.debug;
  var root = document.createElement('div');
  root.className = 'slice isEntering';
  root.setAttribute('contenteditable', 'false');
  root.dataset.sliceId = String(++sliceId);
  root.dataset.kind = kindKey || 'unknown';
  root.innerHTML = "\n        <div class=\"sliceRow\">\n          <div class=\"sliceTopHandle\" title=\"Minimizar/expandir corte\"></div>\n          <button class=\"sliceDockBtn\" type=\"button\" title=\"Enviar para lateral\"></button>\n          <div class=\"gutter left\" title=\"Fechar corte\"></div>\n\n          <div class=\"sliceCard\">\n            <div class=\"sliceHead\">\n              <div class=\"badge\"><strong>".concat(escapeHtml(badge), "</strong> <span>").concat(escapeHtml(title), "</span></div>\n              <div class=\"sliceMeta\">").concat(escapeHtml(meta || ""), "</div>\n            </div>\n            <div class=\"sliceBody\">\n              <div class=\"panel\">\n                <div class=\"panelBody\">").concat(escapeHtml(body), "</div>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"gutter right\" title=\"Fechar corte\"></div>\n        </div>\n      ");
  var closeWithAnimation = function closeWithAnimation() {
    if (root.classList.contains('isClosing')) return;
    root.classList.add('isClosing');
    var removeNow = function removeNow() {
      if (root.parentNode) root.remove();
    };
    root.addEventListener('transitionend', removeNow, {
      once: true
    });
    setTimeout(removeNow, 420);
  };
  var dockSlice = function dockSlice() {
    var page = root.closest('.page');
    var dock = sliceDockEl || document.querySelector('.sliceDock');
    if (!dock) return;
    if (root.classList.contains('isClosing')) return;
    var parent = root.parentNode;
    if (!parent) return;
    var anchor = document.createElement('span');
    anchor.className = 'sliceAnchor';
    anchor.id = "sliceAnchor".concat(++dockAnchorId);
    anchor.setAttribute('contenteditable', 'false');
    parent.insertBefore(anchor, root.nextSibling);
    var tag = document.createElement('button');
    tag.type = 'button';
    tag.className = "sliceTag k-".concat(root.dataset.kind || 'unknown');
    tag.textContent = "".concat(badge, " ").concat(title);
    tag.title = "Reabrir ".concat(title);
    tag.dataset.sliceId = root.dataset.sliceId;
    tag.dataset.anchorId = anchor.id;
    var drag = null;
    var moved = false;
    var dragThreshold = 4;
    var stopDrag = function stopDrag() {
      drag = null;
      tag.classList.remove('isDragging');
    };
    var onPointerMove = function onPointerMove(ev) {
      if (!drag) return;
      var nextTop = drag.startTop + (ev.clientY - drag.startY);
      var _getDockTagBounds3 = getDockTagBounds(tag),
        minTop = _getDockTagBounds3.minTop,
        maxTop = _getDockTagBounds3.maxTop;
      var clampedTop = Math.min(Math.max(minTop, nextTop), maxTop);
      tag.dataset.manualTop = String(clampedTop);
      tag.style.top = "".concat(Math.round(clampedTop), "px");
      if (Math.abs(ev.clientY - drag.startY) > dragThreshold) {
        moved = true;
      }
    };
    var onPointerUp = function onPointerUp() {
      stopDrag();
    };
    tag.addEventListener('pointerdown', function (ev) {
      if (ev.button !== 0) return;
      var currentTop = Number.parseFloat(tag.style.top || "0");
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
    tag.addEventListener('pointerup', function (ev) {
      onPointerUp();
      try {
        tag.releasePointerCapture(ev.pointerId);
      } catch (_e) {}
    });
    tag.addEventListener('pointercancel', onPointerUp);
    tag.addEventListener('click', function () {
      if (moved) {
        moved = false;
        return;
      }
      var targetContent = page ? page.querySelector('.pageContent') : document.getElementById('page1');
      if (targetContent) {
        targetContent.appendChild(root);
        root.classList.add('isEntering');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            return root.classList.remove('isEntering');
          });
        });
        var anchorEl = document.getElementById(tag.dataset.anchorId || "");
        if (anchorEl) anchorEl.remove();
        tag.remove();
        setStatus("reopened: ".concat(title));
      }
    });
    dock.prepend(tag);
    positionSliceDockRail();
    positionDockTag(tag);
    root.remove();
    setStatus("docked: ".concat(title));
  };

  // top border toggles minimize/expand; side gutters close
  var toggle = function toggle() {
    return root.classList.toggle('isMinimized');
  };
  var topHandle = root.querySelector('.sliceTopHandle');
  var dockBtn = root.querySelector('.sliceDockBtn');
  topHandle.addEventListener('click', toggle);
  dockBtn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    dockSlice();
  });
  root.querySelector('.gutter.left').addEventListener('click', closeWithAnimation);
  root.querySelector('.gutter.right').addEventListener('click', closeWithAnimation);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      root.classList.remove('isEntering');
    });
  });
  return root;
}
function getLastWordBeforeToken(textBeforeCaret, token) {
  var idx = textBeforeCaret.lastIndexOf(token);
  if (idx === -1) return "";
  var before = textBeforeCaret.slice(0, idx).trimEnd();
  var m = before.match(/([A-Za-zÀ-ÿ0-9_-]+)\s*$/);
  return m ? m[1] : "";
}
function handleCommand(el, cmd, wordOverride) {
  var token = "--".concat(cmd);
  var textBefore = getTextBeforeCaretWithin(el);
  var word = wordOverride !== null && wordOverride !== void 0 ? wordOverride : cmd === 'd' || cmd === 'c' ? getLastWordBeforeToken(textBefore, token) : "";
  var debug = ["command: ".concat(token), "word: ".concat(word || "(none)"), "pagination: disabled (infinite scroll)", "top: minimize/expand | gutters: close"].join('\n');
  if (cmd === 'h') {
    return makeSlice({
      badge: "01",
      title: "HELP",
      kind: "Help",
      kindKey: "help",
      meta: "comandos e regras",
      body: "- palavra --d  \u2192 define a palavra anterior\n- --v          \u2192 vocabul\xE1rio local\n- --c          \u2192 consulta local (vocab + texto)\n- --h          \u2192 ajuda\n\nTopo do corte: minimiza/abre.\nLaterais (gutter): fecham o corte.\nVoc\xEA continua escrevendo sempre.",
      debug: debug
    });
  }
  if (cmd === 'v') {
    var list = Object.entries(vocab).map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        k = _ref4[0],
        v = _ref4[1];
      return "\u2022 ".concat(k, " \u2014 ").concat(v);
    }).join('\n');
    return makeSlice({
      badge: "02",
      title: "VOCAB",
      kind: "Vocabulary",
      kindKey: "vocab",
      meta: "".concat(Object.keys(vocab).length, " entradas"),
      body: list || "(vazio)",
      debug: debug
    });
  }
  if (cmd === 'd') {
    var w = (word || "").toLowerCase();
    var def = vocab[w] || "N\xE3o encontrei defini\xE7\xE3o local para \u201C".concat(word, "\u201D.\n\n(Depois ligamos seu dicion\xE1rio real / base offline.)");
    return makeSlice({
      badge: "03",
      title: "DEFINE",
      kind: "Definition",
      kindKey: "define",
      meta: word ? "\u201C".concat(word, "\u201D") : "nenhuma palavra detectada",
      body: def,
      debug: debug
    });
  }
  if (cmd === 'c') {
    var term = (word || "").trim();
    var docText = ((el === null || el === void 0 ? void 0 : el.innerText) || "").trim();
    var fold = function fold(s) {
      return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };
    var needle = fold(term);
    var vocabHits = Object.entries(vocab).filter(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        k = _ref6[0],
        v = _ref6[1];
      if (!needle) return false;
      return fold(k).includes(needle) || fold(v).includes(needle);
    });
    var docLines = docText.split(/\r?\n/).map(function (line) {
      return line.trim();
    });
    var docHits = docLines.map(function (line, idx) {
      return {
        line: line,
        idx: idx + 1
      };
    }).filter(function (entry) {
      return needle && entry.line && fold(entry.line).includes(needle);
    }).slice(0, 6);
    var lines = [];
    if (!term) {
      lines.push("Consulta local: digite uma palavra e use `--c`.");
      lines.push("");
      lines.push("Exemplo: `doravante --c`");
    } else {
      lines.push("Termo: \"".concat(term, "\""));
      lines.push("Vocabul\xE1rio: ".concat(vocabHits.length, " hit(s)"));
      if (vocabHits.length) {
        lines.push("");
        lines.push("No vocabulário:");
        vocabHits.slice(0, 4).forEach(function (_ref7) {
          var _ref8 = _slicedToArray(_ref7, 2),
            k = _ref8[0],
            v = _ref8[1];
          return lines.push("\u2022 ".concat(k, " \u2014 ").concat(v));
        });
      }
      lines.push("");
      lines.push("No texto atual: ".concat(docHits.length, " trecho(s)"));
      if (docHits.length) {
        docHits.forEach(function (h) {
          return lines.push("\u2022 L".concat(h.idx, ": ").concat(h.line));
        });
      } else {
        lines.push("• nenhum trecho encontrado");
      }
    }
    return makeSlice({
      badge: "04",
      title: "CONSULT",
      kind: "Consult",
      kindKey: "consult",
      meta: term ? "termo: ".concat(term) : "termo: (vazio)",
      body: lines.join('\n'),
      debug: debug
    });
  }
  return makeSlice({
    badge: "00",
    title: "UNKNOWN",
    kind: "Error",
    kindKey: "unknown",
    meta: token,
    body: "N\xE3o existe handler para ".concat(token, "."),
    debug: debug
  });
}
function maybeTriggerCommand(el) {
  var textBefore = getTextBeforeCaretWithin(el);
  var m = textBefore.match(/--([a-z])\s*$/i);
  if (!m) return;
  var cmd = (m[1] || "").toLowerCase();
  var token = "--".concat(cmd);
  var tokenLen = token.length;
  var word = cmd === 'd' || cmd === 'c' ? getLastWordBeforeToken(textBefore, token) : "";

  // remove token
  deleteCharsBeforeCaretWithin(el, tokenLen);

  // insert slice
  var sliceNode = handleCommand(el, cmd, word);
  insertNodeAtCaret(sliceNode);
  setStatus("slice: --".concat(cmd));
}

// pagination removed: infinite single document

// ====== wiring ======
function wirePage(el) {
  var t = null;
  resetFlowMarkerState(el);
  el.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter') return;
    ev.preventDefault();
    insertTextAtCaret('\n');
    el.dispatchEvent(new Event('input', {
      bubbles: true
    }));
  });
  el.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      maybeTriggerCommand(el);
      syncFlowPageMarkers(el, {
        allowGrowth: true
      });
      syncOuterScrollerMetric(el);
      syncOuterScrollerFromContent(el);
    }, 60);
  });
  el.addEventListener('scroll', function () {
    syncFlowPageMarkers(el, {
      allowGrowth: false
    });
    syncOuterScrollerMetric(el);
    syncOuterScrollerFromContent(el);
  });
  syncFlowPageMarkers(el, {
    allowGrowth: true
  });
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
if (outerScrollEl) {
  outerScrollEl.addEventListener('scroll', function () {
    if (syncOuterLock) return;
    var el = currentPageEditable() || document.getElementById('page1');
    if (!el) return;
    syncInnerLock = true;
    el.scrollTop = outerScrollEl.scrollTop;
    syncInnerLock = false;
    syncFlowPageMarkers(el, {
      allowGrowth: false
    });
    refreshDockTags();
  });
}
window.addEventListener('resize', function () {
  var el = document.getElementById('page1');
  if (el) positionPageFlowRail(el);
  positionSliceDockRail();
  refreshDockTags();
  if (el) {
    syncOuterScrollerMetric(el);
    syncOuterScrollerFromContent(el);
  }
});

// focus first page
document.getElementById('page1').focus();
setStatus('ready');
window.__ESKREV_INDEX2_READY__ = true;