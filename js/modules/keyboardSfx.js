const TYPE_URL = "src/assets/audio/type.wav";
const ENTER_URL = "src/assets/audio/enter.wav";
const BACKSPACE_URL = "src/assets/audio/backspace.wav";

export function createKeyboardSfx() {
  const state = {
    audioCtx: null,
    gainNode: null,
    buffers: {},
    fallback: {
      type: new Audio(TYPE_URL),
      enter: new Audio(ENTER_URL),
      backspace: new Audio(BACKSPACE_URL),
    },
    lastTypeAt: 0,
  };

  const isMuted = () => localStorage.getItem("skrv_sfx_muted") === "true";

  const loadBuffer = async (name, url) => {
    if (!state.audioCtx) return;
    try {
      const res = await fetch(url);
      const ab = await res.arrayBuffer();
      state.buffers[name] = await state.audioCtx.decodeAudioData(ab);
    } catch (_e) {}
  };

  const initContext = () => {
    if (state.audioCtx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    state.audioCtx = new Ctx();
    state.gainNode = state.audioCtx.createGain();
    state.gainNode.gain.value = 0.28;
    state.gainNode.connect(state.audioCtx.destination);
    loadBuffer("type", TYPE_URL);
    loadBuffer("enter", ENTER_URL);
    loadBuffer("backspace", BACKSPACE_URL);
  };

  const unlock = () => {
    initContext();
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
  };

  const playFallback = (name) => {
    const el = state.fallback[name] || state.fallback.type;
    if (!el) return;
    try {
      el.currentTime = 0;
      el.volume = 0.25;
      el.play().catch(() => {});
    } catch (_e) {}
  };

  const play = (name) => {
    if (isMuted()) return;
    if (!state.audioCtx || !state.gainNode) {
      playFallback(name);
      return;
    }
    if (state.audioCtx.state === "suspended") state.audioCtx.resume();
    const key = name === "backspace" && !state.buffers.backspace ? "type" : name;
    const buffer = state.buffers[key];
    if (!buffer) {
      playFallback(name);
      return;
    }
    try {
      const src = state.audioCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(state.gainNode);
      src.start(0);
    } catch (_e) {}
  };

  const playForKey = (ev) => {
    if (!ev || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const key = String(ev.key || "");
    if (key === "Enter") {
      play("enter");
      return;
    }
    if (key === "Backspace" || key === "Delete") {
      play("backspace");
      return;
    }
    if (key.length === 1) {
      const now = performance.now();
      if ((now - state.lastTypeAt) < 24) return;
      state.lastTypeAt = now;
      play("type");
    }
  };

  const bind = () => {
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
  };

  return { bind, playForKey, play };
}
