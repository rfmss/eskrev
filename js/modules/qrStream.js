// qrStream.js — QR streaming para transferência ao celular

const CHUNK_SIZE  = 200;
const FRAME_MS    = 450;
const QR_VERSION  = "v1";
const QR_SIZE     = 260;

let libPromise = null;

function loadScript(src, key) {
  if (window[key]) return Promise.resolve();
  const existing = document.querySelector(`script[data-qrLib="${key}"]`);
  if (existing) return new Promise((res, rej) => {
    existing.addEventListener("load", res, { once: true });
    existing.addEventListener("error", rej, { once: true });
  });
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src;
    s.dataset.qrLib = key;
    s.onload = res;
    s.onerror = () => rej(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(s);
  });
}

async function ensureLibs() {
  if (window.QRCode && window.LZString) return;
  if (libPromise) return libPromise;
  libPromise = Promise.all([
    loadScript("src/assets/js/qrcode.min.js",  "QRCode"),
    loadScript("src/assets/js/lz-string.min.js", "LZString"),
  ]).finally(() => { libPromise = null; });
  return libPromise;
}

function buildPayload() {
  const pages    = document.querySelectorAll(".pageContent");
  const pagesHtml = Array.from(pages).map(el => el.innerHTML);
  let data = {};
  try { data = JSON.parse(localStorage.getItem("skrv_data") || "{}"); } catch (_) {}
  const notes   = JSON.parse(localStorage.getItem("skrv_mobile_notes_v1") || "[]");
  const postits = JSON.parse(localStorage.getItem("skrv_postits_v1") || "[]");
  return { ...data, pagesHtml, notes, postits, skv_version: 2 };
}

function buildBase64() {
  return window.LZString.compressToBase64(JSON.stringify(buildPayload()));
}

// CRC-32
const CRC_TABLE = (() => {
  const t = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t.push(c >>> 0);
  }
  return t;
})();
function crc32(str) {
  let c = 0 ^ -1;
  for (let i = 0; i < str.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ str.charCodeAt(i)) & 0xff];
  return ((c ^ -1) >>> 0).toString(16).padStart(8, "0");
}

export function buildQrSliceBody() {
  return `<div class="qrSliceWrap">
  <div class="qrSliceCode" id="qrStreamCode"></div>
  <p  class="qrSliceStatus" id="qrStreamStatus">carregando…</p>
  <p  class="qrSliceMeta"   id="qrStreamMeta"></p>
  <div class="qrSliceActions">
    <button class="qrSliceBtn" id="qrStreamPause" type="button">pausar</button>
    <button class="qrSliceBtn" id="qrStreamCopy"  type="button">copiar base64</button>
  </div>
  <p class="qrSliceHint">Abra <strong>eskrev.app</strong> no celular → Importar</p>
</div>`;
}

export async function initQrSlice(sliceEl) {
  const statusEl = sliceEl.querySelector("#qrStreamStatus");
  const metaEl   = sliceEl.querySelector("#qrStreamMeta");
  const codeEl   = sliceEl.querySelector("#qrStreamCode");
  const pauseBtn = sliceEl.querySelector("#qrStreamPause");
  const copyBtn  = sliceEl.querySelector("#qrStreamCopy");

  try {
    await ensureLibs();
  } catch (_) {
    if (statusEl) statusEl.textContent = "erro: bibliotecas QR indisponíveis";
    return;
  }

  const base64 = buildBase64();
  const chunks  = base64.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")) || [];
  const total   = chunks.length;
  const id      = Date.now().toString().slice(-6);
  let idx    = 0;
  let timer  = null;
  let paused = false;

  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg")?.trim() || "#f5f2ea";

  const qr = new window.QRCode(codeEl, {
    width: QR_SIZE, height: QR_SIZE,
    colorLight: bg,
    correctLevel: window.QRCode.CorrectLevel.Q,
  });

  function frame() {
    const chunk = chunks[idx];
    qr.clear();
    qr.makeCode(`${QR_VERSION}|${id}|${idx + 1}|${total}|${crc32(chunk)}|${chunk}`);
    if (statusEl) statusEl.textContent = `transmitindo · ID ${id}`;
    if (metaEl)   metaEl.textContent   = `frame ${String(idx + 1).padStart(3, "0")} / ${String(total).padStart(3, "0")}`;
    idx = (idx + 1) % total;
  }

  function start() { if (!timer) { timer = setInterval(frame, FRAME_MS); frame(); } }
  function stop()  { clearInterval(timer); timer = null; }

  start();

  if (pauseBtn) {
    pauseBtn.onclick = () => {
      paused = !paused;
      if (paused) { stop();  pauseBtn.textContent = "retomar"; if (statusEl) statusEl.textContent = "pausado"; }
      else         { start(); pauseBtn.textContent = "pausar"; }
    };
  }

  if (copyBtn) {
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(base64);
        copyBtn.textContent = "copiado!";
        setTimeout(() => { copyBtn.textContent = "copiar base64"; }, 1500);
      } catch (_) {}
    };
  }

  // Para o stream quando o corte é removido do DOM
  const obs = new MutationObserver(() => {
    if (!sliceEl.isConnected) { stop(); obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}
