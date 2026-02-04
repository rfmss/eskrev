#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const LANG_PATH = path.join(ROOT, "src", "js", "modules", "lang.js");
const OUT_PATH = path.join(ROOT, "docs", "copydeck.md");

const DOMAIN_RULES = [
  { name: "Manifesto & Legal", match: (k) => k.startsWith("manifesto_") || k.startsWith("terms_") || k.startsWith("privacy_") || k.startsWith("support_") },
  { name: "Verify", match: (k) => k.startsWith("verify_") },
  { name: "X-Ray / Rastro", match: (k) => k.startsWith("xray_") },
  { name: "Consultas", match: (k) => k.startsWith("consult_") },
  { name: "Export & Compartilhar", match: (k) => k.startsWith("export_") || k.startsWith("share_") || k.startsWith("fediverse_") },
  { name: "Seguranca", match: (k) => k.startsWith("reset_") || k.startsWith("danger_") || k.startsWith("lock_") || k === "locked" || k === "unlock_btn" || k === "wrong_pass" },
  { name: "Pomodoro", match: (k) => k.startsWith("pomo_") },
  { name: "Editor", match: (k) => k.startsWith("editor_") || k.startsWith("font_") || k.startsWith("search_") || k.startsWith("audio_") || k.startsWith("reader_") || k.startsWith("controls_") || k.startsWith("paste_") || k.startsWith("copy_") || k.startsWith("stats_") || k.startsWith("marquee_") || k === "welcome" },
  { name: "Setup & Sessao", match: (k) => k.startsWith("setup_") || k === "create_pass" || k === "repeat_pass" || k === "start_btn" || k === "setup_password_note" || k === "toggle_password_show" },
  { name: "UI Geral", match: (k) => k.startsWith("modal_") || k.startsWith("project_") || k.startsWith("lang_") || k === "page_title" || k === "verify_title" || k === "verify_tip" || k === "verify_link" || k === "close_label" || k === "manifesto_open" || k === "consult_title" || k === "consult_button" },
];

const CONTEXT_RULES = [
  { label: "Button", match: (k) => k.endsWith("_btn") || k.endsWith("_button") || k.includes("_btn_") },
  { label: "Title", match: (k) => k.endsWith("_title") },
  { label: "Label", match: (k) => k.endsWith("_label") },
  { label: "Placeholder", match: (k) => k.endsWith("_ph") || k.includes("_ph_") },
  { label: "Tooltip", match: (k) => k.endsWith("_tip") || k.endsWith("_tooltip") || k.endsWith("_title") && k.includes("_close_") },
  { label: "Hint", match: (k) => k.endsWith("_hint") },
  { label: "Note", match: (k) => k.endsWith("_note") },
  { label: "Body", match: (k) => k.endsWith("_body") || k.endsWith("_full") },
  { label: "Link", match: (k) => k.endsWith("_link") },
  { label: "Status", match: (k) => k.includes("_status") },
  { label: "Message", match: (k) => k.includes("_message") },
  { label: "Heading", match: (k) => k.endsWith("_heading") },
  { label: "Legend", match: (k) => k.endsWith("_legend") },
  { label: "Badge", match: (k) => k.endsWith("_badge") },
  { label: "Action", match: (k) => k.startsWith("reset_") || k.startsWith("lock_") },
];

const STATE_RULES = [
  { label: "Error", match: (k) => k.includes("error") || k.includes("invalid") || k.includes("fail") },
  { label: "Warning", match: (k) => k.includes("warn") || k.includes("danger") || k.includes("caution") },
  { label: "Success", match: (k) => k.includes("success") || k.includes("done") || k.includes("ok") || k.includes("added") },
  { label: "Loading", match: (k) => k.includes("loading") },
  { label: "Empty", match: (k) => k.includes("empty") },
  { label: "Locked", match: (k) => k.includes("locked") },
  { label: "Active", match: (k) => k.includes("active") },
];

const escapeCell = (value) => {
  if (value === undefined || value === null) return "";
  const str = String(value);
  return str
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>")
    .replace(/\r/g, "");
};

const inferContext = (key) => {
  const rule = CONTEXT_RULES.find((r) => r.match(key));
  return rule ? rule.label : "Text";
};

const inferState = (key) => {
  const rule = STATE_RULES.find((r) => r.match(key));
  return rule ? rule.label : "Default";
};

const domainForKey = (key) => {
  const rule = DOMAIN_RULES.find((r) => r.match(key));
  return rule ? rule.name : "Outros";
};

const buildMarkdown = (lang) => {
  const languages = lang.languages.map((entry) => entry.code);
  const db = lang.db;
  const allKeys = new Set();

  for (const code of languages) {
    const dict = db[code] || {};
    Object.keys(dict).forEach((key) => allKeys.add(key));
  }

  const sortedKeys = Array.from(allKeys).sort();
  const grouped = new Map();

  for (const key of sortedKeys) {
    const domain = domainForKey(key);
    if (!grouped.has(domain)) grouped.set(domain, []);
    grouped.get(domain).push(key);
  }

  const header = [
    "# Copydeck",
    "",
    "Este arquivo e gerado automaticamente a partir de `src/js/modules/lang.js`.",
    "Nao edite manualmente: use `node scripts/export_copydeck.js`.",
    "",
  ];

  const lines = [...header];

  for (const [domain, keys] of grouped) {
    lines.push(`## ${domain}`);
    lines.push("");
    lines.push("| Key | Contexto | Estado | PT | EN | ES | FR |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- |");

    for (const key of keys) {
      const pt = escapeCell(db.pt?.[key] ?? "");
      const en = escapeCell(db["en-uk"]?.[key] ?? "");
      const es = escapeCell(db.es?.[key] ?? "");
      const fr = escapeCell(db.fr?.[key] ?? "");
      const context = inferContext(key);
      const state = inferState(key);
      lines.push(`| ${key} | ${context} | ${state} | ${pt} | ${en} | ${es} | ${fr} |`);
    }

    lines.push("");
  }

  return lines.join("\n");
};

(async () => {
  try {
    const mod = await import(pathToFileURL(LANG_PATH).href);
    const output = buildMarkdown(mod.lang);
    fs.writeFileSync(OUT_PATH, output, "utf8");
    process.stdout.write(`copydeck gerado em ${path.relative(ROOT, OUT_PATH)}\n`);
  } catch (err) {
    process.stderr.write(`Falha ao gerar copydeck: ${err.message}\n`);
    process.exit(1);
  }
})();
