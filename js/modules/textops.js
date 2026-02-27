export function getLastWordBeforeToken(textBeforeCaret, token) {
  const idx = textBeforeCaret.lastIndexOf(token);
  if (idx === -1) return "";
  const before = textBeforeCaret.slice(0, idx).trimEnd();
  const m = before.match(/([A-Za-zÀ-ÿ0-9_-]+)\s*$/);
  return m ? m[1] : "";
}
