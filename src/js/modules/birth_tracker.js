export const birthTracker = {
    state: {
        firstKeyTime: null,
        lastKeyTime: null,
        keystrokeCount: 0,
        cert: "ENABLED"
    },

    storageKey: "lit_birth_tracker",

    init(editorEl) {
        if (!editorEl) return;
        this.load();
        this.bind(editorEl);
    },

    load() {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                this.state = { ...this.state, ...parsed };
            }
        } catch (_) {
            // Mantem estado padrao se armazenamento estiver corrompido.
        }
    },

    persist() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    },

    markKeystroke() {
        const now = Date.now();
        if (!this.state.firstKeyTime) this.state.firstKeyTime = now;
        this.state.lastKeyTime = now;
        this.state.keystrokeCount += 1;
        this.persist();
    },

    disableCert() {
        if (this.state.cert === "DISABLED") return;
        this.state.cert = "DISABLED";
        this.persist();
    },

    bind(editorEl) {
        editorEl.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key.length === 1 || e.key === "Enter" || e.key === "Backspace") {
                this.markKeystroke();
            }
        });

        editorEl.addEventListener("paste", (e) => {
            const source = e && e.skrvPasteSource ? e.skrvPasteSource : "";
            if (source === "internal" || source === "blocked") return;
            this.disableCert();
        });

        editorEl.addEventListener("drop", () => {
            this.disableCert();
        });
    }
};

if (typeof window !== "undefined") {
    window.skrvBirthDisable = () => birthTracker.disableCert();
}
