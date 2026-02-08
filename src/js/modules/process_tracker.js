export const processTracker = {
    storageKey: "skrv_process_tracker",
    state: {
        started_at: "",
        ended_at: "",
        keystrokes_total: 0,
        insertions: 0,
        deletions: 0,
        revisions: 0,
        pause_profile: { short: 0, medium: 0, long: 0 },
        last_event_at: 0,
        last_text_length: null,
        last_action: null,
        last_action_at: 0
    },

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
                if (!this.state.pause_profile) {
                    this.state.pause_profile = { short: 0, medium: 0, long: 0 };
                }
            }
        } catch (_) {
            // keep defaults on corrupted data
        }
    },

    persist() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    },

    markEvent(now) {
        if (!now) now = Date.now();
        if (!this.state.started_at) this.state.started_at = new Date(now).toISOString();
        this.state.ended_at = new Date(now).toISOString();
        if (this.state.last_event_at) {
            const delta = now - this.state.last_event_at;
            if (delta >= 10000) this.state.pause_profile.long += 1;
            else if (delta >= 2000) this.state.pause_profile.medium += 1;
            else if (delta >= 200) this.state.pause_profile.short += 1;
        }
        this.state.last_event_at = now;
    },

    markKeystroke() {
        const now = Date.now();
        this.markEvent(now);
        this.state.keystrokes_total += 1;
        this.persist();
    },

    markInput(editorEl, inputType) {
        if (!editorEl) return;
        const now = Date.now();
        const text = editorEl.innerText || "";
        const len = text.length;
        if (this.state.last_text_length == null) {
            this.state.last_text_length = len;
            this.persist();
            return;
        }
        const delta = len - this.state.last_text_length;
        const isPaste = inputType === "insertFromPaste" || inputType === "insertFromDrop";
        const isInsert = inputType && inputType.startsWith("insert");
        const isDelete = inputType && inputType.startsWith("delete");

        if (isInsert && !isPaste && delta > 0) {
            this.state.insertions += delta;
            this.state.last_action = "insert";
            this.state.last_action_at = now;
        }
        if (isDelete) {
            const amount = Math.max(1, Math.abs(delta));
            this.state.deletions += amount;
            if (this.state.last_action === "insert" && now - this.state.last_action_at < 20000) {
                this.state.revisions += amount;
            }
            this.state.last_action = "delete";
            this.state.last_action_at = now;
        }
        if (inputType === "insertReplacementText") {
            this.state.revisions += Math.max(1, Math.abs(delta));
            this.state.last_action = "insert";
            this.state.last_action_at = now;
        }
        this.state.last_text_length = len;
        this.persist();
    },

    bind(editorEl) {
        editorEl.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key.length === 1 || e.key === "Enter" || e.key === "Backspace" || e.key === "Delete") {
                this.markKeystroke();
            }
        });

        editorEl.addEventListener("input", (e) => {
            this.markInput(editorEl, e.inputType);
        });
    }
};
