function formatLangLabel(label) {
    return String(label || "").replace(/^[^\w]*\s*/u, "");
}

export function setNextLangButtonLabel(lang, buttonEl) {
    if (!buttonEl || !lang || !Array.isArray(lang.languages) || !lang.languages.length) return;
    const idx = lang.languages.findIndex((item) => item.code === lang.current);
    const next = lang.languages[(idx + 1 + lang.languages.length) % lang.languages.length];
    if (next) buttonEl.textContent = formatLangLabel(next.label);
}
