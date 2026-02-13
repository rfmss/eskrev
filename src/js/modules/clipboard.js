export function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve) => {
        const area = document.createElement("textarea");
        area.value = String(text || "");
        area.setAttribute("readonly", "true");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
        resolve();
    });
}

export function bindCopyTargets(selector, onCopy) {
    const items = Array.from(document.querySelectorAll(selector));
    items.forEach((item) => {
        if (item.dataset.copyBound === "1") return;
        item.dataset.copyBound = "1";
        item.addEventListener("click", () => onCopy(item));
    });
    return items.length;
}
