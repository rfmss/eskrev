const CACHE_NAME = "skrv-cache-v62";
const CACHE_ASSETS = [
  "./",
  "./index.html",
  "./index.html?v=5",
  "./mobile.html",
  "./src/mobile/mobile.css",
  "./src/mobile/mobile.js",
  "./totbooks.html",
  "./verify.html",
  "./manifest.json?v=5",
  "./src/css/main.css",
  "./src/css/mobile-only.css",
  "./src/css/fonts.css",
  "./src/css/base.css",
  "./src/css/layout.css",
  "./src/css/components.css",
  "./src/js/app.js",
  "./src/js/modules/auth.js",
  "./src/js/modules/birth_tracker.js",
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
  "./src/assets/js/qrcode.min.js",
  "./src/assets/js/lz-string.min.js",
  "./src/assets/js/phosphor.js",
  "./src/assets/lingua/pt_dict_core.json",
  "./src/assets/lingua/pt_dict_chunk_1.json",
  "./src/assets/lingua/pt_dict_chunk_2.json",
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
  "./src/js/modules/xray_tests.js",
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
  "./src/assets/icons/icon-192.svg?v=3",
  "./src/assets/icons/icon-512.svg?v=3",
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
      await Promise.all(CACHE_ASSETS.map((asset) => cacheAsset(asset)));
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
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      const fallback = async () => {
        if (isNav) {
          if (wantsMobile) {
            const mobileCached = await caches.match("./mobile.html");
            if (mobileCached) return mobileCached;
          }
          const indexCached = await caches.match("./index.html");
          if (indexCached) return indexCached;
        }
        return cached || new Response("", { status: 504, statusText: "offline" });
      };
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => fallback());
    })
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "cache-status") return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    let cached = 0;
    await Promise.all(
      CACHE_ASSETS.map(async (asset) => {
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
      total: CACHE_ASSETS.length + cachedFio,
    };
    if (event.source && event.source.postMessage) {
      event.source.postMessage(payload);
      return;
    }
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((client) => client.postMessage(payload));
  })());
});
