function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(function () {
  var LANGS = {
    pt: {
      lang_label: "PTBR",
      mobile_notes_mode: "NOTAS",
      mobile_gate_title: "Importar projeto",
      mobile_gate_body: "Abra o scanner e traga seu projeto de um notebook (exportar > stream QR), tablet ou outra carteira eskrev em outro celular.",
      mobile_gate_scan: "LER QR CODE",
      mobile_intro: "Aqui é sua carteira de projetos. No desktop: Mesa > puxar do celular ou abrir .skv. (faça backups)",
      mobile_top_note: "Nada é enviado. Nada é rastreado. Tudo fica local.",
      mobile_empty_title: "Importe um projeto",
      mobile_empty_body: "O celular guarda o livro inteiro e espera um desktop para despejar.",
      mobile_scan: "TRAZER PROJETO",
      mobile_book_title: "Caderninho",
      mobile_extract: "Extrair",
      mobile_extract_qr: "Extrair por QR",
      mobile_extract_body: "Retire o projeto do celular em qualquer formato.",
      mobile_demo_book: "Me toque",
      mobile_demo_title: "Como usar",
      mobile_demo_body: "Toque para abrir.\nArraste para baixo e solte para apagar.\nMáximo: 6 projetos (use outro navegador para mais).\nUse TRAZER PROJETO para importar um .skv.",
      mobile_export_qr: "ENVIAR POR QR",
      mobile_export_save: "SALVAR .SKV",
      mobile_export_b64: "SALVAR .B64",
      mobile_export_copy: "COPIAR B64",
      mobile_footer_note: "Eskrev é grátis. Se foi útil pra você, considere apoiar o projeto para manter domínio, hospedagem e manutenção:",
      mobile_footer_support: "apoie: <span class=\"marquee-copy\" data-copy=\"BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP\">BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP</span> | <span class=\"marquee-copy\" data-copy=\"eskrev@disroot.org\">eskrev@disroot.org</span> pix/paypal",
      mobile_limit: "Limite máximo de projetos salvos.",
      mobile_delete_label: "Deletar",
      mobile_delete_confirm: "Deletar projeto?",
      mobile_cancel_label: "Cancelar",
      cancel_label: "Cancelar",
      delete_label: "Deletar",
      mobile_trash: "Apagar",
      close_label: "OK",
      qr_scan_title: "SCAN QR",
      qr_scan_wait: "AGUARDANDO QR...",
      qr_scan_stop: "PARAR SCAN",
      qr_fallback_hint: "Sem câmera? Importe o arquivo .b64/.skv ou cole a string.",
      qr_fallback_import: "IMPORTAR ARQUIVO",
      qr_fallback_paste: "Cole a string base64",
      qr_fallback_restore: "RESTAURAR",
      qr_stream_title: "STREAM QR",
      qr_stream_active: "STREAM ATIVO",
      qr_stream_pause: "PAUSAR",
      qr_stream_resume: "CONTINUAR",
      qr_stream_copy: "COPIAR BASE64",
      qr_stream_save: "SALVAR .B64",
      qr_stream_hint: "Feche para encerrar o envio.",
      qr_stream_empty: "Nada para enviar.",
      qr_frame: "FRAME",
      qr_restore_in_progress: "RESTAURANDO...",
      qr_decode_fail: "Falha ao restaurar.",
      qr_camera_blocked: "Câmera bloqueada.",
      qr_camera_missing: "Câmera indisponível.",
      qr_no_detector: "Detector não disponível.",
      qr_using_fallback: "Usando fallback.",
      qr_libs_missing: "Bibliotecas ausentes."
    },
    en: {
      lang_label: "EN",
      mobile_notes_mode: "NOTES",
      mobile_gate_title: "Import project",
      mobile_gate_body: "Open the scanner and bring your project from a notebook (export > stream QR), tablet, or another eskrev wallet on a different phone.",
      mobile_gate_scan: "READ QR CODE",
      mobile_intro: "This is your project wallet. On desktop: Desk > pull from phone or open .skv. (make backups)",
      mobile_top_note: "Nothing is sent. Nothing is tracked. Everything stays local.",
      mobile_empty_title: "Import a project",
      mobile_empty_body: "Your phone keeps the whole book and waits for a desktop to pour it out.",
      mobile_scan: "BRING PROJECT",
      mobile_book_title: "Notebook",
      mobile_extract: "Extract",
      mobile_extract_qr: "Extract by QR",
      mobile_extract_body: "Retrieve the project from your phone in any format.",
      mobile_demo_book: "Touch me",
      mobile_demo_title: "How it works",
      mobile_demo_body: "Tap to open.\nDrag down and release to delete.\nMax: 6 projects (use another browser for more).\nUse BRING PROJECT to import a .skv.",
      mobile_export_qr: "SEND BY QR",
      mobile_export_save: "SAVE .SKV",
      mobile_export_b64: "SAVE .B64",
      mobile_export_copy: "COPY B64",
      mobile_footer_note: "Eskrev is free. If you found it useful, consider supporting the project to keep domain, hosting, and maintenance:",
      mobile_footer_support: "support: <span class=\"marquee-copy\" data-copy=\"BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP\">BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP</span> | <span class=\"marquee-copy\" data-copy=\"eskrev@disroot.org\">eskrev@disroot.org</span> pix/paypal",
      mobile_limit: "Maximum projects saved.",
      mobile_delete_label: "Delete",
      mobile_delete_confirm: "Delete project?",
      mobile_cancel_label: "Cancel",
      cancel_label: "Cancel",
      delete_label: "Delete",
      mobile_trash: "Delete",
      close_label: "OK",
      qr_scan_title: "SCAN QR",
      qr_scan_wait: "WAITING FOR QR...",
      qr_scan_stop: "STOP SCAN",
      qr_fallback_hint: "No camera? Import .b64/.skv or paste the string.",
      qr_fallback_import: "IMPORT FILE",
      qr_fallback_paste: "Paste base64 string",
      qr_fallback_restore: "RESTORE",
      qr_stream_title: "QR STREAM",
      qr_stream_active: "STREAM ACTIVE",
      qr_stream_pause: "PAUSE",
      qr_stream_resume: "RESUME",
      qr_stream_copy: "COPY BASE64",
      qr_stream_save: "SAVE .B64",
      qr_stream_hint: "Close to stop sending.",
      qr_stream_empty: "Nothing to send.",
      qr_frame: "FRAME",
      qr_restore_in_progress: "RESTORING...",
      qr_decode_fail: "Failed to restore.",
      qr_camera_blocked: "Camera blocked.",
      qr_camera_missing: "Camera unavailable.",
      qr_no_detector: "Detector not available.",
      qr_using_fallback: "Using fallback.",
      qr_libs_missing: "Libraries missing."
    },
    es: {
      lang_label: "ES",
      mobile_notes_mode: "NOTAS",
      mobile_gate_title: "Importar proyecto",
      mobile_gate_body: "Abre el escáner y trae tu proyecto desde un notebook (exportar > stream QR), tablet u otra billetera eskrev en otro celular.",
      mobile_gate_scan: "LEER QR",
      mobile_intro: "Esta es tu cartera de proyectos. En desktop: Mesa > traer desde el celular o abrir .skv. (haz backups)",
      mobile_top_note: "Nada se envía. Nada se rastrea. Todo queda local.",
      mobile_empty_title: "Importa un proyecto",
      mobile_empty_body: "El celular guarda todo el libro y espera un escritorio para vaciarlo.",
      mobile_scan: "TRAER PROYECTO",
      mobile_book_title: "Cuaderno",
      mobile_extract: "Extraer",
      mobile_extract_qr: "Extraer por QR",
      mobile_extract_body: "Retira el proyecto del teléfono en cualquier formato.",
      mobile_demo_book: "Tócame",
      mobile_demo_title: "Cómo usar",
      mobile_demo_body: "Toca para abrir.\nArrastra hacia abajo y suelta para borrar.\nMáximo: 6 proyectos (usa otro navegador para más).\nUsa TRAER PROYECTO para importar un .skv.",
      mobile_export_qr: "ENVIAR POR QR",
      mobile_export_save: "GUARDAR .SKV",
      mobile_export_b64: "GUARDAR .B64",
      mobile_export_copy: "COPIAR B64",
      mobile_footer_note: "Eskrev es gratis. Si te resultó útil, considera apoyar el proyecto para mantener dominio, hosting y mantenimiento:",
      mobile_footer_support: "apoya: <span class=\"marquee-copy\" data-copy=\"BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP\">BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP</span> | <span class=\"marquee-copy\" data-copy=\"eskrev@disroot.org\">eskrev@disroot.org</span> pix/paypal",
      mobile_limit: "Límite máximo de proyectos guardados.",
      mobile_delete_label: "Borrar",
      mobile_delete_confirm: "¿Borrar proyecto?",
      mobile_cancel_label: "Cancelar",
      cancel_label: "Cancelar",
      delete_label: "Borrar",
      mobile_trash: "Borrar",
      close_label: "OK",
      qr_scan_title: "SCAN QR",
      qr_scan_wait: "ESPERANDO QR...",
      qr_scan_stop: "DETENER",
      qr_fallback_hint: "Sin cámara? Importa .b64/.skv o pega la cadena.",
      qr_fallback_import: "IMPORTAR ARCHIVO",
      qr_fallback_paste: "Pega la cadena base64",
      qr_fallback_restore: "RESTAURAR",
      qr_stream_title: "STREAM QR",
      qr_stream_active: "STREAM ACTIVO",
      qr_stream_pause: "PAUSAR",
      qr_stream_resume: "CONTINUAR",
      qr_stream_copy: "COPIAR BASE64",
      qr_stream_save: "GUARDAR .B64",
      qr_stream_hint: "Cierra para detener.",
      qr_stream_empty: "Nada para enviar.",
      qr_frame: "FRAME",
      qr_restore_in_progress: "RESTAURANDO...",
      qr_decode_fail: "Fallo al restaurar.",
      qr_camera_blocked: "Cámara bloqueada.",
      qr_camera_missing: "Cámara no disponible.",
      qr_no_detector: "Detector no disponible.",
      qr_using_fallback: "Usando fallback.",
      qr_libs_missing: "Bibliotecas ausentes."
    },
    fr: {
      lang_label: "FR",
      mobile_notes_mode: "NOTES",
      mobile_gate_title: "Importer un projet",
      mobile_gate_body: "Ouvrez le scanner et importez votre projet depuis un notebook (exporter > stream QR), une tablette ou un autre portefeuille eskrev sur un autre téléphone.",
      mobile_gate_scan: "LIRE QR",
      mobile_intro: "Ici, c'est votre portefeuille de projets. Sur desktop : Table > récupérer du mobile ou ouvrir .skv. (faites des sauvegardes)",
      mobile_top_note: "Rien n'est envoyé. Rien n'est suivi. Tout reste local.",
      mobile_empty_title: "Importer un projet",
      mobile_empty_body: "Le téléphone garde tout le livre et attend un desktop pour le verser.",
      mobile_scan: "APPORTER PROJET",
      mobile_book_title: "Carnet",
      mobile_extract: "Extraire",
      mobile_extract_qr: "Extraire par QR",
      mobile_extract_body: "Retirez le projet du téléphone dans n'importe quel format.",
      mobile_demo_book: "Touchez-moi",
      mobile_demo_title: "Comment utiliser",
      mobile_demo_body: "Touchez pour ouvrir.\nFaites glisser vers le bas et relâchez pour supprimer.\nMax: 6 projets (utilisez un autre navigateur pour plus).\nUtilisez APPORTER PROJET pour importer un .skv.",
      mobile_export_qr: "ENVOYER PAR QR",
      mobile_export_save: "ENREGISTRER .SKV",
      mobile_export_b64: "ENREGISTRER .B64",
      mobile_export_copy: "COPIER B64",
      mobile_footer_note: "Eskrev est gratuit. Si vous l’avez trouvé utile, vous pouvez soutenir le projet pour assurer domaine, hébergement et maintenance:",
      mobile_footer_support: "soutenez : <span class=\"marquee-copy\" data-copy=\"BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP\">BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP</span> | <span class=\"marquee-copy\" data-copy=\"eskrev@disroot.org\">eskrev@disroot.org</span> pix/paypal",
      mobile_limit: "Limite maximum de projets enregistrés.",
      mobile_delete_label: "Supprimer",
      mobile_delete_confirm: "Supprimer le projet ?",
      mobile_cancel_label: "Annuler",
      cancel_label: "Annuler",
      delete_label: "Supprimer",
      mobile_trash: "Supprimer",
      close_label: "OK",
      qr_scan_title: "SCAN QR",
      qr_scan_wait: "EN ATTENTE...",
      qr_scan_stop: "ARRETER",
      qr_fallback_hint: "Pas de caméra? Importez .b64/.skv ou collez la chaîne.",
      qr_fallback_import: "IMPORTER",
      qr_fallback_paste: "Collez la chaîne base64",
      qr_fallback_restore: "RESTAURER",
      qr_stream_title: "STREAM QR",
      qr_stream_active: "STREAM ACTIF",
      qr_stream_pause: "PAUSE",
      qr_stream_resume: "CONTINUER",
      qr_stream_copy: "COPIER BASE64",
      qr_stream_save: "ENREGISTRER .B64",
      qr_stream_hint: "Fermez pour arrêter.",
      qr_stream_empty: "Rien à envoyer.",
      qr_frame: "FRAME",
      qr_restore_in_progress: "RESTAURATION...",
      qr_decode_fail: "Échec de restauration.",
      qr_camera_blocked: "Caméra bloquée.",
      qr_camera_missing: "Caméra indisponible.",
      qr_no_detector: "Détecteur indisponible.",
      qr_using_fallback: "Fallback utilisé.",
      qr_libs_missing: "Bibliothèques manquantes."
    }
  };
  var STORAGE_KEY = "skrv_mobile_payloads";
  var DEMO_DISMISSED_KEY = "skrv_mobile_demo_dismissed";
  var MAX_BOOKS = 6;
  var state = {
    lang: (localStorage.getItem("lit_lang") || "pt").toLowerCase().includes("en") ? "en" : (localStorage.getItem("lit_lang") || "pt").toLowerCase().includes("es") ? "es" : (localStorage.getItem("lit_lang") || "pt").toLowerCase().includes("fr") ? "fr" : "pt",
    activeId: null
  };
  var els = {};
  var t = function t(key) {
    var dict = LANGS[state.lang] || LANGS.pt;
    return dict[key] || LANGS.pt[key] || key;
  };
  var setOverlayActive = function setOverlayActive(el, isActive) {
    if (!el) return;
    el.classList.toggle("active", Boolean(isActive));
    el.setAttribute("aria-hidden", isActive ? "false" : "true");
  };
  var applyI18n = function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (key) el.innerHTML = t(key);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (key) el.setAttribute("placeholder", t(key));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (key) el.setAttribute("title", t(key));
    });
    if (els.langToggle) els.langToggle.textContent = t("lang_label");
  };
  var cycleLang = function cycleLang() {
    var order = ["pt", "en", "es", "fr"];
    var idx = order.indexOf(state.lang);
    state.lang = order[(idx + 1) % order.length];
    localStorage.setItem("lit_lang", state.lang);
    applyI18n();
    renderBooks();
    if (els.bookModal && els.bookModal.classList.contains("active")) {
      renderBookModal();
    }
  };
  var buildDemoPayload = function buildDemoPayload() {
    return {
      HEADER: {
        CREATED: new Date().toISOString()
      },
      ARCHIVE_STATE: {
        skvTitle: t("mobile_demo_book"),
        projects: [{
          id: "demo",
          name: t("mobile_demo_book"),
          content: "",
          date: new Date().toLocaleString(),
          cursorPos: 0
        }],
        activeId: "demo",
        memo: ""
      }
    };
  };
  var savePayloads = function savePayloads(items) {
    var list = Array.isArray(items) ? items : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };
  var loadPayloads = function loadPayloads() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      var list = Array.isArray(parsed) ? parsed : [];
      if (!list.length && localStorage.getItem(DEMO_DISMISSED_KEY) !== "1") {
        return [{
          id: "demo",
          payload: buildDemoPayload(),
          demo: true
        }];
      }
      return list;
    } catch (_) {
      return [];
    }
  };
  var payloadDate = function payloadDate(payload) {
    var iso = payload && payload.HEADER && payload.HEADER.CREATED ? payload.HEADER.CREATED : "";
    var d = iso ? new Date(iso) : new Date();
    if (Number.isNaN(d.getTime())) return new Date().toLocaleDateString();
    return d.toLocaleDateString();
  };
  var payloadProjectName = function payloadProjectName(payload) {
    var archive = payload && payload.ARCHIVE_STATE ? payload.ARCHIVE_STATE : null;
    if (archive && archive.skvTitle) return String(archive.skvTitle);
    if (!archive || !Array.isArray(archive.projects) || !archive.projects.length) return "";
    var active = archive.projects.find(function (p) {
      return p.id === archive.activeId;
    }) || archive.projects[0];
    return active && active.name ? String(active.name) : "";
  };
  var STRAP_COLORS = ["#f9d976", "#ffd6a5", "#fbcfe8", "#c7d2fe", "#bae6fd", "#a7f3d0", "#bbf7d0", "#fde68a", "#fecaca", "#e9d5ff", "#fce7f3", "#d1fae5"];
  var pickStrapColor = function pickStrapColor() {
    return STRAP_COLORS[Math.floor(Math.random() * STRAP_COLORS.length)];
  };
  var getGridConfig = function getGridConfig() {
    var isLandscape = window.matchMedia && window.matchMedia("(orientation: landscape)").matches;
    return isLandscape ? {
      cols: 6,
      rows: 1
    } : {
      cols: 3,
      rows: 2
    };
  };
  var renderBooks = function renderBooks() {
    var items = loadPayloads();
    if (!els.grid || !els.empty || !els.library) return;
    els.grid.innerHTML = "";
    if (!items.length) {
      els.empty.classList.remove("is-hidden");
      document.body.classList.add("empty-only");
      document.body.classList.remove("has-books");
      if (els.scanBar) els.scanBar.style.display = "none";
      if (els.scanPrimary) {
        els.scanPrimary.classList.add("in-empty");
        els.empty.appendChild(els.scanPrimary);
      }
    } else {
      els.empty.classList.add("is-hidden");
      document.body.classList.remove("empty-only");
      document.body.classList.add("has-books");
      if (els.scanBar) els.scanBar.style.display = "";
      if (els.scanPrimary && els.scanBar && !els.scanBar.contains(els.scanPrimary)) {
        els.scanPrimary.classList.remove("in-empty");
        els.scanBar.insertBefore(els.scanPrimary, els.scanBar.firstChild);
      }
    }
    var _getGridConfig = getGridConfig(),
      cols = _getGridConfig.cols,
      rows = _getGridConfig.rows;
    var libRect = els.library.getBoundingClientRect();
    var slotW = libRect.width / cols;
    var slotH = libRect.height / rows;
    var bookW = Math.min(120, slotW * 0.9);
    var bookH = Math.min(170, slotH * 0.9);
    items.slice(0, MAX_BOOKS).forEach(function (item, idx) {
      var col = idx % cols;
      var row = Math.floor(idx / cols);
      var left = col * slotW + (slotW - bookW) / 2;
      var top = row * slotH + (slotH - bookH) / 2;
      var book = document.createElement("div");
      book.className = "totbook".concat(item.demo ? " demo" : "");
      book.dataset.id = item.id;
      book.dataset.slotLeft = String(left);
      book.dataset.slotTop = String(top);
      book.dataset.slotWidth = String(bookW);
      book.dataset.slotHeight = String(bookH);
      if (item.demo) book.dataset.demo = "1";
      book.style.left = "".concat(left, "px");
      book.style.top = "".concat(top, "px");
      book.style.width = "".concat(bookW, "px");
      book.style.height = "".concat(bookH, "px");
      var strapColor = item.strapColor || pickStrapColor();
      item.strapColor = strapColor;
      var bookTitle = item.demo ? t("mobile_demo_title") : t("mobile_extract");
      var bookBodyRaw = item.demo ? t("mobile_demo_body") : t("mobile_extract_body");
      var bookBody = bookBodyRaw.replace(/\n/g, "<br>");
      book.innerHTML = "\n                <div class=\"cover\">\n                    <div class=\"sheen\"></div>\n                    <div class=\"cover-date\">".concat(payloadDate(item.payload), "</div>\n                    <div class=\"strap\" style=\"background:").concat(strapColor, ";\"><span>").concat(payloadProjectName(item.payload) || "Projeto", "</span></div>\n                </div>\n                <div class=\"delete-overlay\"><span>").concat(t("mobile_delete_label"), "</span></div>\n                <div class=\"elastic\"></div>\n                <div class=\"drag-handle\"><div class=\"dots\"></div></div>\n                <div class=\"pages\">\n                    <div class=\"page-viewport\">\n                        <div class=\"sheet\">\n                            <div class=\"book-inner\">\n                                <div class=\"book-inner-title\">").concat(bookTitle, "</div>\n                                <div class=\"book-inner-body\">").concat(bookBody, "</div>\n                                <div class=\"book-inner-actions\">\n                                    <button class=\"btn-full primary\" data-action=\"export-qr\">").concat(t("mobile_export_qr"), "</button>\n                                    <button class=\"btn-full\" data-action=\"export-skv\">").concat(t("mobile_export_save"), "</button>\n                                    <button class=\"btn-full\" data-action=\"export-b64\">").concat(t("mobile_export_b64"), "</button>\n                                    <button class=\"btn-full\" data-action=\"copy-b64\">").concat(t("mobile_export_copy"), "</button>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"pagination\">\n                        <button class=\"prev\" disabled aria-hidden=\"true\">\u2039</button>\n                        <span class=\"page-count\">1/1</span>\n                        <button class=\"next\" disabled aria-hidden=\"true\">\u203A</button>\n                    </div>\n                </div>\n            ");
      els.grid.appendChild(book);
    });
    var realItems = items.filter(function (item) {
      return !item.demo;
    }).slice(0, MAX_BOOKS);
    savePayloads(realItems);
    if (els.scanPrimary && els.limit) {
      if (items.length >= MAX_BOOKS) {
        els.scanPrimary.style.display = "none";
        els.limit.classList.add("active");
      } else {
        els.scanPrimary.style.display = "inline-flex";
        els.limit.classList.remove("active");
      }
    }
  };
  var openGate = function openGate() {
    if (els.gate) setOverlayActive(els.gate, true);
  };
  var closeGate = function closeGate() {
    if (els.gate) setOverlayActive(els.gate, false);
    sessionStorage.setItem("skrv_mobile_gate_done", "1");
  };
  var getPayloadById = function getPayloadById(id) {
    var items = loadPayloads();
    var item = items.find(function (i) {
      return i.id === id;
    });
    return item ? item.payload : null;
  };
  var buildPayload = function buildPayload() {
    if (state.activeId) return getPayloadById(state.activeId);
    var items = loadPayloads();
    return items[0] ? items[0].payload : null;
  };
  var renderBookModal = function renderBookModal() {
    if (!els.bookModalHeader || !els.bookModalBody || !els.bookModalActions) return;
    var payload = buildPayload();
    var isDemo = state.activeId === "demo";
    var projectName = payloadProjectName(payload) || t("mobile_book_title");
    var title = isDemo ? t("mobile_demo_title") : t("mobile_extract");
    var bodyRaw = isDemo ? t("mobile_demo_body") : t("mobile_extract_body");
    var body = bodyRaw.replace(/\n/g, "<br>");
    els.bookModalHeader.innerHTML = "\n            <div class=\"book-modal-kicker\">".concat(projectName, "</div>\n            <div class=\"book-modal-title\">").concat(title, "</div>\n        ");
    els.bookModalBody.innerHTML = body;
    els.bookModalActions.innerHTML = "\n            <button class=\"btn-full primary\" data-action=\"export-qr\">".concat(t("mobile_export_qr"), "</button>\n            <button class=\"btn-full\" data-action=\"export-skv\">").concat(t("mobile_export_save"), "</button>\n            <button class=\"btn-full\" data-action=\"export-b64\">").concat(t("mobile_export_b64"), "</button>\n            <button class=\"btn-full\" data-action=\"copy-b64\">").concat(t("mobile_export_copy"), "</button>\n        ");
  };
  var openBookModal = function openBookModal(sourceRect) {
    if (!els.bookModal) return;
    renderBookModal();
    setOverlayActive(els.bookModal, true);
    document.body.classList.add("has-open-book");
    if (sourceRect && els.bookModalHeader) {
      requestAnimationFrame(function () {
        var panel = els.bookModal.querySelector(".book-modal-panel");
        if (!panel) return;
        var panelRect = panel.getBoundingClientRect();
        var fromScale = sourceRect.width / Math.max(panelRect.width, 1);
        var fromX = sourceRect.left + sourceRect.width / 2 - (panelRect.left + panelRect.width / 2);
        var fromY = sourceRect.top + sourceRect.height / 2 - (panelRect.top + panelRect.height / 2);
        panel.style.setProperty("--book-from-x", "".concat(fromX, "px"));
        panel.style.setProperty("--book-from-y", "".concat(fromY, "px"));
        panel.style.setProperty("--book-from-scale", "".concat(fromScale));
        els.bookModal.classList.add("from-book");
        setTimeout(function () {
          els.bookModal.classList.remove("from-book");
        }, 140);
      });
    }
  };
  var closeBookModal = function closeBookModal() {
    if (!els.bookModal) return;
    setOverlayActive(els.bookModal, false);
    document.body.classList.remove("has-open-book");
  };
  var buildBase64 = function buildBase64(payload) {
    if (!payload || !window.LZString) return "";
    var json = JSON.stringify(payload);
    return window.LZString.compressToBase64(json);
  };
  var parsePayloadFromJson = function parsePayloadFromJson(json) {
    try {
      var parsed = JSON.parse(json);
      if (!parsed || _typeof(parsed) !== "object") return null;
      if (!parsed.HEADER || !parsed.ARCHIVE_STATE) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  };
  var decodeBase64 = function decodeBase64(base64) {
    if (!window.LZString) return null;
    var json = window.LZString.decompressFromBase64(base64.trim());
    if (!json) return null;
    return parsePayloadFromJson(json);
  };
  var addPayload = function addPayload(payload) {
    if (!payload || !payload.ARCHIVE_STATE) return false;
    var items = loadPayloads();
    if (items.length >= MAX_BOOKS) return false;
    var id = "mb_".concat(Date.now(), "_").concat(Math.random().toString(16).slice(2, 8));
    items.push({
      id: id,
      payload: payload,
      strapColor: pickStrapColor(),
      addedAt: new Date().toISOString()
    });
    savePayloads(items);
    state.activeId = id;
    return true;
  };
  var importPayload = function importPayload(payload) {
    var ok = addPayload(payload);
    renderBooks();
    if (ok) closeGate();
    return ok;
  };
  var openScanModal = function openScanModal() {
    if (els.scanModal) setOverlayActive(els.scanModal, true);
    startScan();
  };
  var closeScanModal = function closeScanModal() {
    if (els.scanModal) setOverlayActive(els.scanModal, false);
    stopScan();
  };
  var scanActive = false;
  var scanBusy = false;
  var scanStream = null;
  var scanDetector = null;
  var scanSession = null;
  var scanCanvas = null;
  var scanCtx = null;
  var parseFrame = function parseFrame(raw) {
    var parts = raw.split("|");
    if (parts.length < 6) return null;
    var _parts = _slicedToArray(parts, 6),
      version = _parts[0],
      id = _parts[1],
      idxRaw = _parts[2],
      totalRaw = _parts[3],
      checksum = _parts[4],
      data = _parts[5];
    if (version !== QR_VERSION) return null;
    var index = parseInt(idxRaw, 10);
    var total = parseInt(totalRaw, 10);
    if (!Number.isFinite(index) || !Number.isFinite(total)) return null;
    if (!id || !data) return null;
    if (crc32(data) !== checksum) return null;
    return {
      id: id,
      index: index,
      total: total,
      data: data
    };
  };
  var updateScanStatus = function updateScanStatus(text) {
    if (els.scanStatus) els.scanStatus.textContent = text;
  };
  var initScanGrid = function initScanGrid(total) {
    if (!els.scanGrid) return;
    var columns = Math.ceil(Math.sqrt(total));
    els.scanGrid.innerHTML = "";
    els.scanGrid.style.gridTemplateColumns = "repeat(".concat(columns, ", 1fr)");
    for (var i = 0; i < total; i += 1) {
      var cell = document.createElement("div");
      cell.style.background = "rgba(243,239,230,0.08)";
      cell.style.borderRadius = "3px";
      cell.style.paddingBottom = "100%";
      els.scanGrid.appendChild(cell);
    }
  };
  var markCell = function markCell(index) {
    if (!els.scanGrid) return;
    var cell = els.scanGrid.children[index - 1];
    if (cell) cell.style.background = "rgba(31,79,255,0.6)";
  };
  var handleFrame = function handleFrame(frame) {
    if (!frame) return;
    if (!scanSession || scanSession.id !== frame.id) {
      scanSession = {
        id: frame.id,
        total: frame.total,
        received: new Map()
      };
      initScanGrid(frame.total);
    }
    if (scanSession.total !== frame.total) return;
    if (scanSession.received.has(frame.index)) return;
    scanSession.received.set(frame.index, frame.data);
    markCell(frame.index);
    var receivedCount = scanSession.received.size;
    updateScanStatus("".concat(t("qr_scan_wait"), " ").concat(receivedCount, "/").concat(scanSession.total));
    if (els.scanProgress) {
      var pct = Math.max(0, Math.min(100, receivedCount / scanSession.total * 100));
      els.scanProgress.style.width = "".concat(pct, "%");
    }
    if (receivedCount === scanSession.total) {
      var ordered = [];
      for (var i = 1; i <= scanSession.total; i += 1) {
        ordered.push(scanSession.received.get(i) || "");
      }
      var base64 = ordered.join("");
      var payload = decodeBase64(base64);
      if (payload) {
        importPayload(payload);
      } else {
        updateScanStatus(t("qr_decode_fail"));
      }
      stopScan();
      closeScanModal();
    }
  };
  var _scanLoop = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var codes, width, height, imageData, code, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (!(!scanActive || scanBusy)) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            if (!(!els.scanVideo || els.scanVideo.readyState < 2)) {
              _context.n = 2;
              break;
            }
            requestAnimationFrame(_scanLoop);
            return _context.a(2);
          case 2:
            scanBusy = true;
            _context.p = 3;
            if (!scanDetector) {
              _context.n = 5;
              break;
            }
            _context.n = 4;
            return scanDetector.detect(els.scanVideo);
          case 4:
            codes = _context.v;
            if (codes && codes.length) handleFrame(parseFrame(codes[0].rawValue || ""));
            _context.n = 6;
            break;
          case 5:
            if (scanCtx && scanCanvas && window.jsQR) {
              width = els.scanVideo.videoWidth || 640;
              height = els.scanVideo.videoHeight || 480;
              scanCanvas.width = width;
              scanCanvas.height = height;
              scanCtx.drawImage(els.scanVideo, 0, 0, width, height);
              imageData = scanCtx.getImageData(0, 0, width, height);
              code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert"
              });
              if (code && code.data) handleFrame(parseFrame(code.data));
            }
          case 6:
            _context.n = 8;
            break;
          case 7:
            _context.p = 7;
            _t = _context.v;
          case 8:
            scanBusy = false;
            requestAnimationFrame(_scanLoop);
          case 9:
            return _context.a(2);
        }
      }, _callee, null, [[3, 7]]);
    }));
    return function scanLoop() {
      return _ref.apply(this, arguments);
    };
  }();
  var startScan = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (!(!els.scanVideo || !navigator.mediaDevices)) {
              _context2.n = 1;
              break;
            }
            updateScanStatus(t("qr_camera_missing"));
            return _context2.a(2);
          case 1:
            _context2.p = 1;
            _context2.n = 2;
            return navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: "environment"
              },
              audio: false
            });
          case 2:
            scanStream = _context2.v;
            els.scanVideo.srcObject = scanStream;
            _context2.n = 3;
            return els.scanVideo.play();
          case 3:
            if (!("BarcodeDetector" in window)) {
              _context2.n = 4;
              break;
            }
            scanDetector = new BarcodeDetector({
              formats: ["qr_code"]
            });
            _context2.n = 6;
            break;
          case 4:
            if (!window.jsQR) {
              _context2.n = 5;
              break;
            }
            scanCanvas = document.createElement("canvas");
            scanCtx = scanCanvas.getContext("2d", {
              willReadFrequently: true
            });
            _context2.n = 6;
            break;
          case 5:
            updateScanStatus(t("qr_no_detector"));
            return _context2.a(2);
          case 6:
            scanActive = true;
            updateScanStatus(t("qr_scan_wait"));
            _scanLoop();
            _context2.n = 8;
            break;
          case 7:
            _context2.p = 7;
            _t2 = _context2.v;
            updateScanStatus(t("qr_camera_blocked"));
          case 8:
            return _context2.a(2);
        }
      }, _callee2, null, [[1, 7]]);
    }));
    return function startScan() {
      return _ref2.apply(this, arguments);
    };
  }();
  var stopScan = function stopScan() {
    scanActive = false;
    scanBusy = false;
    if (scanStream) {
      scanStream.getTracks().forEach(function (track) {
        return track.stop();
      });
      scanStream = null;
    }
    if (els.scanVideo) els.scanVideo.srcObject = null;
    scanDetector = null;
    scanCanvas = null;
    scanCtx = null;
    scanSession = null;
  };
  var QR_VERSION = "v1";
  var CHUNK_SIZE = 200;
  var FRAME_INTERVAL_MS = 450;
  var streamTimer = null;
  var streamIndex = 0;
  var streamChunks = [];
  var streamTotal = 0;
  var streamBackupId = "";
  var qrInstance = null;
  var crc32 = function crc32(str) {
    var crc = 0 ^ -1;
    for (var i = 0; i < str.length; i += 1) {
      var byte = str.charCodeAt(i);
      crc = crc >>> 8 ^ CRC_TABLE[(crc ^ byte) & 0xff];
    }
    return ((crc ^ -1) >>> 0).toString(16).padStart(8, "0");
  };
  var CRC_TABLE = function () {
    var table = [];
    for (var i = 0; i < 256; i += 1) {
      var c = i;
      for (var j = 0; j < 8; j += 1) {
        c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1;
      }
      table.push(c >>> 0);
    }
    return table;
  }();
  var setupStreamFromBase64 = function setupStreamFromBase64(base64) {
    streamBackupId = Date.now().toString().slice(-6);
    streamChunks = base64.match(new RegExp(".{1,".concat(CHUNK_SIZE, "}"), "g")) || [];
    streamTotal = streamChunks.length;
    streamIndex = 0;
  };
  var updateStreamMeta = function updateStreamMeta() {
    if (!els.streamMeta) return;
    els.streamMeta.textContent = "".concat(t("qr_frame"), ": ").concat(streamIndex + 1, "/").concat(streamTotal);
  };
  var emitStreamFrame = function emitStreamFrame() {
    if (!streamChunks.length || !els.streamCode || !window.QRCode) return;
    var chunk = streamChunks[streamIndex];
    var payload = [QR_VERSION, streamBackupId, streamIndex, streamTotal, crc32(chunk), chunk].join("|");
    if (!qrInstance) {
      // eslint-disable-next-line no-undef
      qrInstance = new QRCode(els.streamCode, {
        text: payload,
        width: 220,
        height: 220,
        colorDark: "#2d2a26",
        colorLight: "#f5f3ec",
        correctLevel: QRCode.CorrectLevel.L
      });
    } else {
      qrInstance.clear();
      qrInstance.makeCode(payload);
    }
    if (els.streamStatus) els.streamStatus.textContent = t("qr_stream_active");
    updateStreamMeta();
    streamIndex = (streamIndex + 1) % streamTotal;
  };
  var startStream = function startStream(payload) {
    if (!payload) {
      if (els.streamStatus) els.streamStatus.textContent = t("qr_stream_empty");
      return;
    }
    var base64 = buildBase64(payload);
    if (!base64) {
      if (els.streamStatus) els.streamStatus.textContent = t("qr_stream_empty");
      return;
    }
    setupStreamFromBase64(base64);
    emitStreamFrame();
    streamTimer = setInterval(emitStreamFrame, FRAME_INTERVAL_MS);
  };
  var stopStream = function stopStream() {
    if (streamTimer) clearInterval(streamTimer);
    streamTimer = null;
    streamChunks = [];
    streamIndex = 0;
    streamTotal = 0;
    if (qrInstance) {
      qrInstance.clear();
      qrInstance = null;
    }
  };
  var toggleStreamPause = function toggleStreamPause() {
    if (streamTimer) {
      stopStream();
      if (els.streamPause) els.streamPause.textContent = t("qr_stream_resume");
    } else {
      startStream(buildPayload());
      if (els.streamPause) els.streamPause.textContent = t("qr_stream_pause");
    }
  };
  var openStreamModal = function openStreamModal() {
    if (els.streamModal) setOverlayActive(els.streamModal, true);
    startStream(buildPayload());
  };
  var closeStreamModal = function closeStreamModal() {
    if (els.streamModal) setOverlayActive(els.streamModal, false);
    stopStream();
  };
  var initElements = function initElements() {
    els.notesMode = document.getElementById("mobileNotesMode");
    els.langToggle = document.getElementById("mobileLangToggle");
    els.gateLangToggle = document.getElementById("mobileGateLangToggle");
    els.library = document.getElementById("library");
    els.gate = document.getElementById("mobileGate");
    els.gateScan = document.getElementById("mobileGateScan");
    els.grid = document.getElementById("booksGrid");
    els.empty = document.getElementById("mobileEmpty");
    els.scanPrimary = document.getElementById("mobileScanPrimary");
    els.scanBar = document.querySelector(".mobile-scan-bar");
    els.limit = document.getElementById("mobileLimit");
    els.support = document.querySelector(".mobile-support");
    els.confirm = document.getElementById("deleteConfirm");
    els.deleteOk = document.getElementById("deleteOk");
    els.deleteCancel = document.getElementById("deleteCancel");
    els.scanModal = document.getElementById("qrScanModal");
    els.scanVideo = document.getElementById("qrScanVideo");
    els.scanStatus = document.getElementById("qrScanStatus");
    els.scanProgress = document.getElementById("qrScanProgress");
    els.scanGrid = document.getElementById("qrScanGrid");
    els.scanStop = document.getElementById("qrScanStop");
    els.scanImport = document.getElementById("qrScanImport");
    els.scanFile = document.getElementById("qrScanFile");
    els.scanPaste = document.getElementById("qrScanPaste");
    els.scanRestore = document.getElementById("qrScanRestore");
    els.streamModal = document.getElementById("qrStreamModal");
    els.streamCode = document.getElementById("qrStreamCode");
    els.streamStatus = document.getElementById("qrStreamStatus");
    els.streamMeta = document.getElementById("qrStreamMeta");
    els.streamPause = document.getElementById("qrStreamPause");
    els.streamCopy = document.getElementById("qrStreamCopy");
    els.streamSave = document.getElementById("qrStreamSave");
    els.streamClose = document.getElementById("qrStreamClose");
    els.streamCloseX = document.getElementById("qrStreamCloseX");
    els.bookModal = document.getElementById("bookModal");
    els.bookModalHeader = document.getElementById("bookModalHeader");
    els.bookModalBody = document.getElementById("bookModalBody");
    els.bookModalActions = document.getElementById("bookModalActions");
  };
  var bindEvents = function bindEvents() {
    if (els.notesMode) {
      els.notesMode.addEventListener("click", function () {
        window.location.href = "fullm.html?mobile=notes&standalone=1";
      });
    }
    if (els.langToggle) els.langToggle.addEventListener("click", cycleLang);
    if (els.gateLangToggle) els.gateLangToggle.addEventListener("click", cycleLang);
    if (els.gateScan) els.gateScan.addEventListener("click", function () {
      closeGate();
      openScanModal();
    });
    if (els.scanPrimary) els.scanPrimary.addEventListener("click", openScanModal);
    if (els.streamClose) els.streamClose.addEventListener("click", closeStreamModal);
    if (els.streamCloseX) els.streamCloseX.addEventListener("click", closeStreamModal);
    var dragBook = null;
    var dragStart = null;
    var dragMoved = false;
    var moveRaf = null;
    var lastDy = 0;
    var pendingDeleteId = null;
    var getSlot = function getSlot(book) {
      return {
        left: parseFloat(book.dataset.slotLeft || "0"),
        top: parseFloat(book.dataset.slotTop || "0")
      };
    };
    var setBookTop = function setBookTop(book, top) {
      if (!els.library) return;
      var libRect = els.library.getBoundingClientRect();
      var maxY = Math.max(0, libRect.height - book.offsetHeight);
      var ny = Math.max(0, Math.min(maxY, top));
      book.style.top = "".concat(ny, "px");
    };
    var closeAllBooks = function closeAllBooks() {
      state.activeId = null;
      closeBookModal();
    };
    var openBook = function openBook(book) {
      if (!book) return;
      state.activeId = book.dataset.id || null;
      var rect = book.getBoundingClientRect();
      openBookModal(rect);
    };
    var setDeleteProgress = function setDeleteProgress(book, pct) {
      if (!book) return;
      var clamped = Math.max(0, Math.min(1, pct));
      book.style.setProperty("--delete-progress", clamped.toString());
      book.classList.toggle("is-deleting", clamped > 0.05);
    };
    var showDeleteConfirm = function showDeleteConfirm(id) {
      pendingDeleteId = id;
      if (els.confirm) els.confirm.classList.add("active");
    };
    var hideDeleteConfirm = function hideDeleteConfirm() {
      pendingDeleteId = null;
      if (els.confirm) els.confirm.classList.remove("active");
    };
    if (els.grid) {
      els.grid.addEventListener("pointerdown", function (e) {
        var book = e.target.closest(".totbook");
        if (!book || book.classList.contains("open")) return;
        dragBook = book;
        dragStart = {
          x: e.clientX,
          y: e.clientY
        };
        dragMoved = false;
        document.body.classList.add("is-dragging");
        book.setPointerCapture(e.pointerId);
      });
      els.grid.addEventListener("pointermove", function (e) {
        if (!dragBook || !dragStart) return;
        var dy = e.clientY - dragStart.y;
        if (dy > 6) {
          dragMoved = true;
          lastDy = dy;
          if (moveRaf) return;
          moveRaf = requestAnimationFrame(function () {
            if (!dragBook || !dragStart) {
              moveRaf = null;
              return;
            }
            var slot = getSlot(dragBook);
            setBookTop(dragBook, slot.top + lastDy);
            setDeleteProgress(dragBook, lastDy / 140);
            moveRaf = null;
          });
        }
      });
      els.grid.addEventListener("pointerup", function (e) {
        if (!dragBook) return;
        if (moveRaf) {
          cancelAnimationFrame(moveRaf);
          moveRaf = null;
        }
        dragBook.releasePointerCapture(e.pointerId);
        document.body.classList.remove("is-dragging");
        var dy = dragStart ? e.clientY - dragStart.y : 0;
        var over = dy > 100;
        if (over) {
          showDeleteConfirm(dragBook.dataset.id || null);
        }
        if (!dragMoved) {
          openBook(dragBook);
        } else {
          var slot = getSlot(dragBook);
          var book = dragBook;
          book.classList.add("snap-back");
          book.style.left = "".concat(slot.left, "px");
          book.style.top = "".concat(slot.top, "px");
          var _onEnd = function onEnd() {
            book.classList.remove("snap-back");
            book.removeEventListener("transitionend", _onEnd);
          };
          book.addEventListener("transitionend", _onEnd);
        }
        setDeleteProgress(dragBook, 0);
        dragBook = null;
        dragStart = null;
        dragMoved = false;
      });
      els.grid.addEventListener("pointercancel", function (e) {
        if (!dragBook) return;
        if (moveRaf) {
          cancelAnimationFrame(moveRaf);
          moveRaf = null;
        }
        dragBook.releasePointerCapture(e.pointerId);
        document.body.classList.remove("is-dragging");
        setDeleteProgress(dragBook, 0);
        var slot = getSlot(dragBook);
        var book = dragBook;
        book.classList.add("snap-back");
        book.style.left = "".concat(slot.left, "px");
        book.style.top = "".concat(slot.top, "px");
        var _onEndC = function onEndC() {
          book.classList.remove("snap-back");
          book.removeEventListener("transitionend", _onEndC);
        };
        book.addEventListener("transitionend", _onEndC);
        dragBook = null;
        dragStart = null;
        dragMoved = false;
      });
    }
    document.addEventListener("click", function (e) {
      if (els.streamModal && els.streamModal.classList.contains("active")) {
        if (e.target === els.streamModal) closeStreamModal();
        return;
      }
      if (els.bookModal && els.bookModal.classList.contains("active")) {
        if (e.target === els.bookModal) closeAllBooks();
        return;
      }
      if (!els.grid) return;
      if (e.target.closest(".totbook")) return;
      closeAllBooks();
    });
    if (els.deleteCancel) {
      els.deleteCancel.addEventListener("click", function (e) {
        e.preventDefault();
        hideDeleteConfirm();
      });
    }
    if (els.deleteOk) {
      els.deleteOk.addEventListener("click", function (e) {
        e.preventDefault();
        if (!pendingDeleteId) return;
        if (pendingDeleteId === "demo") {
          localStorage.setItem(DEMO_DISMISSED_KEY, "1");
        }
        var items = loadPayloads().filter(function (item) {
          return item.id !== pendingDeleteId;
        });
        savePayloads(items);
        hideDeleteConfirm();
        renderBooks();
      });
    }
    var handleBookAction = function handleBookAction(action) {
      var payload = buildPayload();
      if (!payload) return;
      if (action === "export-qr") {
        closeBookModal();
        openStreamModal();
        return;
      }
      if (action === "export-skv") {
        var title = payloadProjectName(payload) || "skv";
        var safeName = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
        var slug = safeName || "skv";
        var json = JSON.stringify(payload, null, 2);
        var blob = new Blob([json], {
          type: "application/json;charset=utf-8"
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "".concat(slug, "_").concat(Date.now(), ".skv");
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
      if (action === "export-b64") {
        var _title = payloadProjectName(payload) || "skv";
        var _safeName = _title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
        var _slug = _safeName || "skv";
        var base64 = buildBase64(payload);
        var _blob = new Blob([base64], {
          type: "text/plain;charset=utf-8"
        });
        var _url = URL.createObjectURL(_blob);
        var _a = document.createElement("a");
        _a.href = _url;
        _a.download = "".concat(_slug, "_").concat(Date.now(), ".b64");
        _a.click();
        URL.revokeObjectURL(_url);
        return;
      }
      if (action === "copy-b64") {
        var _navigator$clipboard;
        var _base = buildBase64(payload);
        (_navigator$clipboard = navigator.clipboard) === null || _navigator$clipboard === void 0 || _navigator$clipboard.writeText(_base)["catch"](function () {});
      }
    };
    if (els.grid) {
      els.grid.addEventListener("click", function (e) {
        var actionEl = e.target.closest("[data-action]");
        if (actionEl) {
          var action = actionEl.getAttribute("data-action") || "";
          var book = e.target.closest(".totbook");
          if (book) state.activeId = book.dataset.id || null;
          handleBookAction(action);
          return;
        }
      });
    }
    if (els.bookModalActions) {
      els.bookModalActions.addEventListener("click", function (e) {
        var actionEl = e.target.closest("[data-action]");
        if (!actionEl) return;
        var action = actionEl.getAttribute("data-action") || "";
        handleBookAction(action);
      });
    }
    if (els.support) {
      els.support.addEventListener("click", function (e) {
        var _navigator$clipboard2;
        var target = e.target.closest(".marquee-copy");
        if (!target) return;
        var value = target.getAttribute("data-copy");
        if (!value) return;
        (_navigator$clipboard2 = navigator.clipboard) === null || _navigator$clipboard2 === void 0 || _navigator$clipboard2.writeText(value)["catch"](function () {});
        target.classList.add("is-copied");
        setTimeout(function () {
          target.classList.remove("is-copied");
        }, 900);
      });
    }
    if (els.scanStop) els.scanStop.addEventListener("click", closeScanModal);
    if (els.scanImport && els.scanFile) {
      els.scanImport.addEventListener("click", function () {
        return els.scanFile.click();
      });
      els.scanFile.addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var raw = String(reader.result || "");
          var payload = raw.trim().startsWith("{") ? parsePayloadFromJson(raw) : decodeBase64(raw);
          if (payload) {
            importPayload(payload);
            closeScanModal();
          }
        };
        reader.readAsText(file);
      });
    }
    if (els.scanPaste && els.scanRestore) {
      var update = function update() {
        var raw = (els.scanPaste.value || "").trim();
        els.scanRestore.disabled = !raw;
      };
      els.scanPaste.addEventListener("input", update);
      els.scanRestore.addEventListener("click", function () {
        var raw = (els.scanPaste.value || "").trim();
        var payload = decodeBase64(raw);
        if (payload) {
          importPayload(payload);
          closeScanModal();
        }
      });
      update();
    }
    if (els.streamPause) els.streamPause.addEventListener("click", toggleStreamPause);
    if (els.streamCopy) {
      els.streamCopy.addEventListener("click", function () {
        var _navigator$clipboard3;
        var payload = buildPayload();
        var base64 = buildBase64(payload);
        (_navigator$clipboard3 = navigator.clipboard) === null || _navigator$clipboard3 === void 0 || _navigator$clipboard3.writeText(base64)["catch"](function () {});
      });
    }
    if (els.streamSave) {
      els.streamSave.addEventListener("click", function () {
        var payload = buildPayload();
        var base64 = buildBase64(payload);
        var blob = new Blob([base64], {
          type: "text/plain;charset=utf-8"
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "SKRV_QR_".concat(Date.now(), ".b64");
        a.click();
        URL.revokeObjectURL(url);
      });
    }
    if (els.streamClose) {
      els.streamClose.addEventListener("click", closeStreamModal);
    }
  };
  var init = function init() {
    initElements();
    applyI18n();
    bindEvents();
    renderBooks();
    window.addEventListener("resize", function () {
      renderBooks();
    });
    closeGate();
  };
  window.addEventListener("DOMContentLoaded", init);
})();