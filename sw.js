const CACHE_NAME = "skrv-cache-v147";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./mobile.html",
  "./verify.html",
  "./manifest.json",
  // CSS — modo onep (index.html)
  "./styles/index2.css",
  // CSS — modo fullm / componentes compartilhados
  "./src/css/main.css",
  "./src/css/motion_eskrev.css",
  "./src/css/mobile-only.css",
  "./src/css/fonts.css",
  "./src/css/base.css",
  "./src/css/layout.css",
  "./src/css/components.css",
  "./src/css/tokens_iso.css",
  "./src/css/theme_iso.css",
  // JS — modo onep (index.html): entry point + todos os módulos
  "./js/main.js",
  "./js/modules/coordenador.js",
  "./js/modules/dock.js",
  "./js/modules/dom.js",
  "./js/modules/flowMarkers.js",
  "./js/modules/grammarLint.js",
  "./js/modules/grammarLintExtended.js",
  "./js/modules/idb.js",
  "./js/modules/keyboardSfx.js",
  "./js/modules/layout.js",
  "./js/modules/lexCheck.js",
  "./js/modules/mesa.js",
  "./js/modules/notes.js",
  "./js/modules/pageFlow.js",
  "./js/modules/page.js",
  "./js/modules/postits.js",
  "./js/modules/scrollSync.js",
  "./js/modules/selectionToolbar.js",
  "./js/modules/slices.js",
  "./js/modules/textops.js",
  "./js/modules/themes.js",
  "./js/modules/verbete.js",
  "./js/modules/wordclass.js",
  "./js/modules/styleAnalysis.js",
  "./js/modules/perf.js",
  // JS — módulos src (compartilhados com verify.html e mobile.html)
  "./src/js/modules/crypto_manager.js",
  "./src/js/modules/corpus.js",
  "./src/js/modules/lang.js",
  // JS — mobile
  "./src/mobile/mobile.css",
  "./src/mobile/mobile.js",
  // JS — libs externas
  "./src/assets/js/qrcode.min.js",
  "./src/assets/js/lz-string.min.js",
  "./src/assets/js/phosphor.js",
  // Ícones essenciais
  "./src/assets/icons/icon-192.svg",
  "./src/assets/icons/icon-512.svg",
  "./src/assets/icons/logoEskrev.svg",
  "./src/assets/icons/logoEskrev-favicon-dark.svg",
  "./src/assets/icons/logoEskrev-favicon-cream.svg",
  "./src/assets/icons/eskrev.ico",
  "./src/assets/icons/eskrev.png",
  "./qr-bitcoin.png"
];
const CACHE_ASSETS_ALL = [
  "./",
  "./index.html",
  "./mobile.html",
  "./verify.html",
  "./manifest.json",
  // CSS
  "./styles/index2.css",
  "./src/css/main.css",
  "./src/css/motion_eskrev.css",
  "./src/css/mobile-only.css",
  "./src/css/fonts.css",
  "./src/css/base.css",
  "./src/css/layout.css",
  "./src/css/components.css",
  "./src/css/tokens_iso.css",
  "./src/css/theme_iso.css",
  // JS — modo onep
  "./js/main.js",
  "./js/modules/coordenador.js",
  "./js/modules/dock.js",
  "./js/modules/dom.js",
  "./js/modules/flowMarkers.js",
  "./js/modules/grammarLint.js",
  "./js/modules/grammarLintExtended.js",
  "./js/modules/idb.js",
  "./js/modules/keyboardSfx.js",
  "./js/modules/layout.js",
  "./js/modules/lexCheck.js",
  "./js/modules/mesa.js",
  "./js/modules/notes.js",
  "./js/modules/pageFlow.js",
  "./js/modules/page.js",
  "./js/modules/postits.js",
  "./js/modules/scrollSync.js",
  "./js/modules/selectionToolbar.js",
  "./js/modules/slices.js",
  "./js/modules/textops.js",
  "./js/modules/themes.js",
  "./js/modules/verbete.js",
  "./js/modules/wordclass.js",
  "./js/modules/styleAnalysis.js",
  // JS — módulos src
  "./src/js/app.js",
  "./src/js/modules/auth.js",
  "./src/js/modules/birth_tracker.js",
  "./src/js/modules/crypto_manager.js",
  "./src/js/modules/corpus.js",
  "./src/js/modules/editor.js",
  "./src/js/modules/export_skrv.js",
  "./src/js/modules/lang.js",
  "./src/js/modules/process_tracker.js",
  "./src/js/modules/store.js",
  "./src/js/modules/ui.js",
  "./src/js/modules/qr_transfer.js",
  "./src/js/modules/mobile.js",
  "./src/js/modules/pt_dictionary.js",
  "./src/js/modules/pt_pos_lexicon.js",
  "./src/js/modules/xray_tests.js",
  // JS — mobile
  "./src/mobile/mobile.css",
  "./src/mobile/mobile.js",
  // JS — libs externas
  "./src/assets/js/qrcode.min.js",
  "./src/assets/js/lz-string.min.js",
  "./src/assets/js/phosphor.js",
  // Corpus linguístico (22 arquivos — lazy load, background cache)
  "./src/assets/corpus/literature/literary_analysis.json",
  "./src/assets/corpus/literature/literary_periods.json",
  "./src/assets/corpus/morphology/classes.json",
  "./src/assets/corpus/morphology/flexion_nominal.json",
  "./src/assets/corpus/morphology/flexion_verbal.json",
  "./src/assets/corpus/morphology/prefixes.json",
  "./src/assets/corpus/morphology/roots.json",
  "./src/assets/corpus/morphology/suffixes.json",
  "./src/assets/corpus/morphology/word_formation.json",
  "./src/assets/corpus/orthography/accentuation.json",
  "./src/assets/corpus/orthography/hyphen.json",
  "./src/assets/corpus/orthography/spelling_rules.json",
  "./src/assets/corpus/punctuation/punctuation.json",
  "./src/assets/corpus/semantics/semantics.json",
  "./src/assets/corpus/stylistics/figures.json",
  "./src/assets/corpus/syntax/concordancia.json",
  "./src/assets/corpus/syntax/regencia.json",
  "./src/assets/corpus/syntax/sentence_analysis.json",
  "./src/assets/corpus/text_production/argumentation.json",
  "./src/assets/corpus/text_production/cohesion_coherence.json",
  "./src/assets/corpus/text_production/text_genres.json",
  "./src/assets/corpus/variation/linguistic_variation.json",
  // Dicionário PT — todos os chunks (offline-first completo)
  "./src/assets/lingua/pt_dict_core.json",
  "./src/assets/lingua/pt_dict_rich_chunk_index.json",
  "./src/assets/lingua/pt_dict_rich_chunk__.json",
  "./src/assets/lingua/pt_dict_rich_chunk_a.json",
  "./src/assets/lingua/pt_dict_rich_chunk_b.json",
  "./src/assets/lingua/pt_dict_rich_chunk_c.json",
  "./src/assets/lingua/pt_dict_rich_chunk_d.json",
  "./src/assets/lingua/pt_dict_rich_chunk_e.json",
  "./src/assets/lingua/pt_dict_rich_chunk_f.json",
  "./src/assets/lingua/pt_dict_rich_chunk_g.json",
  "./src/assets/lingua/pt_dict_rich_chunk_h.json",
  "./src/assets/lingua/pt_dict_rich_chunk_i.json",
  "./src/assets/lingua/pt_dict_rich_chunk_j.json",
  "./src/assets/lingua/pt_dict_rich_chunk_k.json",
  "./src/assets/lingua/pt_dict_rich_chunk_l.json",
  "./src/assets/lingua/pt_dict_rich_chunk_m.json",
  "./src/assets/lingua/pt_dict_rich_chunk_n.json",
  "./src/assets/lingua/pt_dict_rich_chunk_o.json",
  "./src/assets/lingua/pt_dict_rich_chunk_p.json",
  "./src/assets/lingua/pt_dict_rich_chunk_q.json",
  "./src/assets/lingua/pt_dict_rich_chunk_r.json",
  "./src/assets/lingua/pt_dict_rich_chunk_s.json",
  "./src/assets/lingua/pt_dict_rich_chunk_t.json",
  "./src/assets/lingua/pt_dict_rich_chunk_u.json",
  "./src/assets/lingua/pt_dict_rich_chunk_v.json",
  "./src/assets/lingua/pt_dict_rich_chunk_w.json",
  "./src/assets/lingua/pt_dict_rich_chunk_x.json",
  "./src/assets/lingua/pt_dict_rich_chunk_y.json",
  "./src/assets/lingua/pt_dict_rich_chunk_z.json",
  "./src/assets/lingua/pt_accent_map.json",
  "./src/assets/lingua/pt_duvidas.json",
  "./src/assets/lingua/pt_regencias.json",
  "./src/assets/lingua/pt_pos_core.json",
  "./src/assets/lingua/pt_pos_chunk_1.json",
  "./src/assets/lingua/pt_pos_chunk_2.json",
  "./src/assets/lingua/pt_pos_chunk_3.json",
  "./src/assets/data/pt_lexicon_core.json",
  "./src/assets/data/pt_lexicon_chunk_1.json",
  "./src/assets/data/pt_lexicon_chunk_2.json",
  "./src/assets/data/pt_lexicon_chunk_3.json",
  "./src/assets/data/pt_lexicon_chunk_4.json",
  "./src/assets/data/pt_lexicon_chunk_5.json",
  "./src/assets/data/pt_lexicon_chunk_6.json",
  "./src/assets/data/pt_lexicon_chunk_7.json",
  "./src/assets/data/pt_lexicon_chunk_8.json",
  "./src/assets/data/pt_lexicon_chunk_9.json",
  "./src/assets/data/pt_lexicon_chunk_10.json",
  "./src/assets/data/pt_lexicon_chunk_11.json",
  "./src/assets/data/pt_lexicon_chunk_12.json",
  "./src/assets/data/pt_lexicon_chunk_13.json",
  "./src/assets/data/pt_lexicon_chunk_14.json",
  "./src/assets/data/pt_lexicon_chunk_15.json",
  "./src/assets/data/pt_lexicon_chunk_16.json",
  "./src/assets/data/pt_lexicon_chunk_17.json",
  "./src/assets/data/pt_lexicon_chunk_18.json",
  "./src/assets/data/pt_lexicon_chunk_19.json",
  "./src/assets/data/pt_lexicon_chunk_20.json",
  "./src/assets/data/pt_lexicon_chunk_21.json",
  "./src/assets/data/pt_lexicon_chunk_22.json",
  "./src/assets/data/pt_lexicon_chunk_23.json",
  "./src/assets/data/pt_lexicon_chunk_24.json",
  "./src/assets/data/pt_lexicon_chunk_25.json",
  "./src/assets/data/pt_lexicon_chunk_26.json",
  "./src/assets/data/pt_lexicon_chunk_27.json",
  "./src/assets/data/pt_lexicon_chunk_28.json",
  "./src/assets/data/pt_lexicon_chunk_29.json",
  "./src/assets/data/pt_lexicon_chunk_30.json",
  "./src/assets/data/pt_lexicon_chunk_31.json",
  "./src/assets/data/pt_lexicon_chunk_32.json",
  "./src/assets/data/pt_lexicon_chunk_33.json",
  "./src/assets/data/pt_lexicon_chunk_34.json",
  "./src/assets/data/pt_lexicon_chunk_35.json",
  "./src/assets/audio/backspace.wav",
  "./src/assets/audio/enter.wav",
  "./src/assets/audio/music.mp3",
  "./src/assets/audio/scificannon.mp3",
  "./src/assets/audio/type.wav",
  "./src/assets/fonts/0xProtoNerdFont-Regular.ttf",
  "./src/assets/fonts/3270NerdFontMono-Regular.ttf",
  "./src/assets/fonts/BlexMonoNerdFont-Text.ttf",
  "./src/assets/fonts/FiraCodeNerdFontPropo-Regular.ttf",
  "./src/assets/fonts/iMWritingMonoNerdFont-Regular.ttf",
  "./src/assets/fonts/JetBrainsMonoNLNerdFont-Regular.ttf",
  "./src/assets/fonts/SymbolsNerdFontMono-Regular.ttf",
  "./src/assets/fonts/SymbolsNerdFont-Regular.ttf",
  "./src/assets/fonts/inter/InterVariable.woff2",
  "./src/assets/fonts/inter/InterVariable-Italic.woff2",
  "./src/assets/fonts/source-serif-4/SourceSerif4-Regular.woff2",
  "./src/assets/fonts/source-serif-4/SourceSerif4-Italic.woff2",
  "./src/assets/fonts/source-serif-4/SourceSerif4-Bold.woff2",
  "./src/assets/fonts/source-serif-4/SourceSerif4-BoldItalic.woff2",
  "./src/assets/fonts/ibm-plex-sans/IBMPlexSans-Regular.woff2",
  "./src/assets/fonts/ibm-plex-sans/IBMPlexSans-Italic.woff2",
  "./src/assets/fonts/ibm-plex-sans/IBMPlexSans-Bold.woff2",
  "./src/assets/fonts/ibm-plex-sans/IBMPlexSans-BoldItalic.woff2",
  "./src/assets/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2",
  "./src/assets/fonts/jetbrains-mono/JetBrainsMono-Italic.woff2",
  "./src/assets/fonts/jetbrains-mono/JetBrainsMono-Bold.woff2",
  "./src/assets/fonts/jetbrains-mono/JetBrainsMono-BoldItalic.woff2",
  "./src/assets/icons/icon-192.svg",
  "./src/assets/icons/icon-512.svg",
  "./src/assets/icons/logoEskrev.svg",
  "./src/assets/icons/logoEskrev-favicon-dark.svg",
  "./src/assets/icons/logoEskrev-favicon-cream.svg",
  "./src/assets/icons/eskrev.ico",
  "./src/assets/icons/eskrev.png",
  "./src/assets/icons/carta_fluck.jpg",
  "./src/assets/icons/tatuagem.jpg",
  "./src/assets/icons/pendulo1.png",
  "./src/assets/icons/pendulo2.png",
  "./src/assets/icons/pendulo3.png",
  "./src/assets/icons/pendulo4.png",
  "./src/assets/icons/pendulo5.png",
  "./src/assets/icons/pendulo6.png",
  "./src/assets/icons/pendulo7.png",
  "./src/assets/icons/pendulo8.png",
  "./src/assets/icons/pendulo9.png",
  "./src/assets/icons/pendulo10.png",
  "./src/assets/fiodoverso/index.json",
  "./config/persona-templates.json",
  "./content/templates/conto-curto.md",
  "./content/templates/romance-keypoints.md",
  "./content/templates/romance-capitulo.md",
  "./content/templates/roteiro-filme.md",
  "./content/templates/roteiro-tv.md",
  "./content/templates/roteiro-novela.md",
  "./content/templates/ensaio-cronica.md",
  "./content/templates/ensaio-pessoal.md",
  "./content/templates/ensaio-opiniao.md",
  "./content/templates/universitario-abnt.md",
  "./content/templates/universitario-artigo.md",
  "./content/templates/enem-redacao.md",
  "./content/enem/themes.json",
  "./sobre/privacidade.html",
  "./sobre/privacidade.en.html",
  "./sobre/privacidade.es.html",
  "./sobre/privacidade.fr.html",
  "./qr-bitcoin.png"
];
const EXTRA_ASSETS = CACHE_ASSETS_ALL.filter((asset) => !CORE_ASSETS.includes(asset));

let FIODOVERSO_FILES = null;

async function loadFiodoversoFiles() {
  if (FIODOVERSO_FILES) return FIODOVERSO_FILES;
  try {
    const res = await fetch("./src/assets/fiodoverso/index.json");
    const data = await res.json();
    const files = [];
    if (data && Array.isArray(data.months)) {
      data.months.forEach((month) => {
        if (!Array.isArray(month.entries)) return;
        month.entries.forEach((entry) => {
          if (entry && entry.file) files.push(`./src/assets/fiodoverso/${entry.file}`);
        });
      });
    }
    FIODOVERSO_FILES = files;
  } catch (_) {
    FIODOVERSO_FILES = [];
  }
  return FIODOVERSO_FILES;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cacheAsset = async (asset) => {
        try {
          const res = await fetch(asset, { cache: "reload" });
          if (res && res.status === 200) {
            await cache.put(asset, res.clone());
          } else {
            console.warn("[sw] cache skipped:", asset, res && res.status);
          }
        } catch (err) {
          console.warn("[sw] cache failed:", asset, err);
        }
      };
      await Promise.all(CORE_ASSETS.map((asset) => cacheAsset(asset)));
      const fioFiles = await loadFiodoversoFiles();
      await Promise.all(fioFiles.map((asset) => cacheAsset(asset)));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const isNav = event.request.mode === "navigate" || event.request.destination === "document";
  const url = new URL(event.request.url);
  const wantsMobile = url.pathname.endsWith("/mobile.html") || url.pathname.endsWith("mobile.html");
  if (isNav) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async (err) => {
          console.warn("[sw] fetch failed, serving from cache:", err && err.message);
          if (wantsMobile) {
            const mobileCached = await caches.match("./mobile.html");
            if (mobileCached) return mobileCached;
          }
          const indexCached = await caches.match("./index.html");
          if (indexCached) return indexCached;
          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><title>offline — eskrev</title></head><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f2ea;color:#1a1a1a;text-align:center;"><div><p style="font-size:13px;opacity:.7;letter-spacing:.04em">Sem conexão. Reabra quando online para sincronizar.</p></div></body></html>',
            { status: 200, headers: { "Content-Type": "text/html;charset=utf-8" } }
          );
        })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch((err) => {
          console.warn("[sw] asset fetch failed:", err && err.message);
          if (cached) return cached;
          return new Response("", { status: 504, statusText: "Gateway Timeout" });
        });
    })
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "cache-extras") {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cacheAsset = async (asset) => {
        try {
          const res = await fetch(asset, { cache: "reload" });
          if (res && res.status === 200) {
            await cache.put(asset, res.clone());
          }
        } catch (_) {}
      };
      await Promise.all(EXTRA_ASSETS.map((asset) => cacheAsset(asset)));
      const fioFiles = await loadFiodoversoFiles();
      await Promise.all(fioFiles.map((asset) => cacheAsset(asset)));
      // Notify all clients that extended cache is complete
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.postMessage({
        type: "cache-status",
        cached: CACHE_ASSETS_ALL.length,
        total: CACHE_ASSETS_ALL.length
      }));
    })());
    return;
  }
  if (data.type !== "cache-status") return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    let cached = 0;
    await Promise.all(
      CACHE_ASSETS_ALL.map(async (asset) => {
        const match = await cache.match(asset);
        if (match) cached += 1;
      })
    );
    const fioFiles = await loadFiodoversoFiles();
    let cachedFio = 0;
    await Promise.all(
      fioFiles.map(async (asset) => {
        const match = await cache.match(asset);
        if (match) cachedFio += 1;
      })
    );
    const payload = {
      type: "cache-status",
      cached: cached + cachedFio,
      total: CACHE_ASSETS_ALL.length + cachedFio,
    };
    if (event.source && event.source.postMessage) {
      event.source.postMessage(payload);
      return;
    }
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((client) => client.postMessage(payload));
  })());
});
