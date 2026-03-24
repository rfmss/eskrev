function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import { fitTopbar, positionSliceDockRail } from "./modules/layout.js";
import { refreshDockTags } from "./modules/dock.js";
import { hydratePostits } from "./modules/postits.js";
import { currentPageEditable } from "./modules/page.js";
import { hydrateDockTags, handleCommand } from "./modules/slices.js";
import { cycleTheme, getCurrentTheme, initThemes, setTheme } from "./modules/themes.js";
import { createKeyboardSfx } from "./modules/keyboardSfx.js";
import { createIntegrationRegistry } from "./integrations/registry.js";
import { initNotesSidebar } from "./modules/notes.js";
import { initMesa, exportSkv } from "./modules/mesa.js";
import { addPage, restorePagesState } from "./modules/pageFlow.js";
import { initWordClass } from "./modules/wordclass.js";
import { initGrammarLint } from "./modules/grammarLint.js";
import { initLexCheck } from "./modules/lexCheck.js";
import { initCoordenador } from "./modules/coordenador.js";
import { idbInit } from "./modules/idb.js";
import { markEditorReady, markFirstAction } from "./modules/perf.js";
import { initOnboard } from "./modules/onboard.js";
import { ensureEditableAnchorAfterNode } from "./modules/dom.js";
var refs = {
  frameEl: document.querySelector(".frame"),
  pagesEl: document.getElementById("pages"),
  statusEl: document.getElementById("status"),
  topbarEl: document.querySelector(".topbar"),
  viewportEl: document.querySelector(".viewport"),
  sliceDockEl: document.getElementById("sliceDockRail"),
  postitLayerEl: document.getElementById("postitLayer"),
  selectionToolbarEl: document.getElementById("selectionToolbar")
};
var state = {
  sliceId: 0,
  dockAnchorId: 0,
  pages: [],
  // array de .pageContent elements
  currentPageIdx: 0,
  dockOffsetX: 20,
  dockOffsetY: 0
};
var ctx = {
  refs: refs,
  state: state,
  integrations: null,
  sfx: createKeyboardSfx(),
  theme: {
    cycle: cycleTheme,
    set: setTheme,
    get: getCurrentTheme
  },
  setStatus: function setStatus(msg) {
    if (refs.statusEl) refs.statusEl.textContent = msg;
  },
  flashCommandError: function flashCommandError() {
    var el = refs.frameEl;
    if (!el) return;
    el.classList.remove("cmdErrorFlash");
    void el.offsetWidth;
    el.classList.add("cmdErrorFlash");
    window.setTimeout(function () {
      return el.classList.remove("cmdErrorFlash");
    }, 380);
  }
};
ctx.integrations = createIntegrationRegistry(ctx);
if (ctx.sfx && ctx.sfx.bind) ctx.sfx.bind();

// ── Init: aguarda IDB pronto antes de restaurar estado ────────────────────
(function () {
  var _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var modosSidebarClose, _onFirstAction;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.n = 1;
          return idbInit();
        case 1:
          // ── Init multi-page ───────────────────────────────────────────────────────
          addPage(ctx, null, true); // cria page1, wires e foca
          restorePagesState(ctx); // restaura conteúdo salvo (ou legado)

          hydrateDockTags(ctx);
          hydratePostits(ctx);
          initThemes();
          positionSliceDockRail(ctx);
          fitTopbar(ctx);
          window.addEventListener("resize", function () {
            return fitTopbar(ctx);
          });
          window.addEventListener("resize", function () {
            positionSliceDockRail(ctx);
            refreshDockTags(ctx);
          });
          ctx.setStatus("ready");
          window.__ESKREV_INDEX2_READY__ = true;
          markEditorReady();
          initOnboard();

          // ── Fixed tab bar ─────────────────────────────────────────────────────────
          Array.prototype.forEach.call(document.querySelectorAll(".ftab[data-cmd]"), function (btn) {
            btn.addEventListener("click", function () {
              var el = currentPageEditable();
              var sliceNode = handleCommand(ctx, el, btn.dataset.cmd);
              if (sliceNode && sliceNode.classList && sliceNode.classList.contains("slice")) {
                var target = el || document.querySelector(".pageContent");
                if (target) {
                  target.appendChild(sliceNode);
                  ensureEditableAnchorAfterNode(sliceNode);
                  target.focus();
                  sliceNode.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                  });
                }
              }
            });
          }); // end forEach ftab

          // ── Modos sidebar close button ────────────────────────────────────────────
          modosSidebarClose = document.getElementById("modosSidebarClose");
          if (modosSidebarClose) {
            modosSidebarClose.addEventListener("click", function () {
              var s = document.getElementById("modosSidebar");
              if (s) {
                s.classList.remove("is-open");
                s.setAttribute("aria-hidden", "true");
              }
            });
          }

          // ── Notes sidebar ─────────────────────────────────────────────────────────
          initNotesSidebar();

          // ── Mesa (arquivos / projetos) ────────────────────────────────────────────
          initMesa(ctx);

          // ── Classes de palavras ───────────────────────────────────────────────────
          initWordClass(ctx);

          // ── Verificador gramatical ────────────────────────────────────────────────
          initGrammarLint(ctx);

          // ── Verificador de vocabulário (léxico PT-BR) ─────────────────────────────
          initLexCheck();

          // ── Coordenador Central ───────────────────────────────────────────────────
          initCoordenador(ctx);

          // ── Foco sempre no editor ao carregar ────────────────────────────────────
          requestAnimationFrame(function () {
            var first = document.getElementById("page1");
            if (first) first.focus();
          });

          // ── Marca primeira ação no editor (TTFA) ─────────────────────────────────
          _onFirstAction = function onFirstAction() {
            markFirstAction();
            document.removeEventListener("keydown", _onFirstAction, true);
            document.removeEventListener("input", _onFirstAction, true);
          };
          document.addEventListener("keydown", _onFirstAction, true);
          document.addEventListener("input", _onFirstAction, true);
          document.addEventListener("keydown", function (ev) {
            var key = String(ev.key || "").toLowerCase();
            var mod = (ev.ctrlKey || ev.metaKey) && !ev.shiftKey && !ev.altKey;

            // Ctrl+S — exportar tudo como .skv
            if (mod && key === "s") {
              ev.preventDefault();
              ev.stopPropagation();
              if (ctx.setStatus) ctx.setStatus("salvando…");
              exportSkv().then(function (filename) {
                if (ctx.setStatus) ctx.setStatus("salvo: " + filename);
              });
              return;
            }

            // Ctrl+A — seleciona tudo na página ativa
            if (mod && key === "a") {
              var editor = currentPageEditable();
              if (!editor) return;
              ev.preventDefault();
              ev.stopPropagation();
              editor.focus();
              var range = document.createRange();
              range.selectNodeContents(editor);
              var sel = window.getSelection();
              if (!sel) return;
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }, true);
        case 2:
          return _context.a(2);
      }
    }, _callee);
  }));
  function init() {
    return _init.apply(this, arguments);
  }
  return init;
})()(); // end async init