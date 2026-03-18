/*
 * idb.js — wrapper IndexedDB com cache síncrono em memória
 *
 * Uso:
 *   await idbInit()           — abre o DB, migra do localStorage, pré-carrega cache
 *   idbGet(key)               — leitura síncrona (do cache)
 *   idbSet(key, value)        — escrita fire-and-forget (cache + IDB)
 *   idbRemove(key)            — remoção fire-and-forget (cache + IDB)
 *
 * Chaves pesadas gerenciadas pelo IDB:
 *   skrv_data, eskrev:onep:pages:v2, skrv_mobile_notes_v1, skrv_postits_v1
 *
 * Chaves leves (preferências) permanecem no localStorage:
 *   skrv_theme_v1, eskrev:index2:lang, skrv_sfx_muted
 */

const DB_NAME    = "eskrev";
const DB_VERSION = 1;
const STORE      = "kv";

// Chaves migradas do localStorage para o IDB
const IDB_KEYS = [
  "skrv_data",
  "eskrev:onep:pages:v2",
  "eskrev:onep:pages:v1",    // legado — migrado pelo pageFlow, removido após
  "skrv_mobile_notes_v1",
  "skrv_postits_v1",
  "tot_data",                // alias legado do skrv_data
  "eskrev:index2:page1:html",// legado single-page
];

const MIGRATED_FLAG = "eskrev:idb:migrated";

let _db    = null;
const _cache = new Map();

function _openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess  = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror    = (e) => reject(e.target.error);
    req.onblocked  = ()  => reject(new Error("IndexedDB bloqueado"));
  });
}

function _idbRead(key) {
  return _openDB().then(
    (db) => new Promise((resolve, reject) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => reject(req.error);
    })
  );
}

function _idbWrite(key, value) {
  return _openDB().then(
    (db) => new Promise((resolve, reject) => {
      const req = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    })
  );
}

function _idbDelete(key) {
  return _openDB().then(
    (db) => new Promise((resolve, reject) => {
      const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    })
  );
}

// ── Migração única localStorage → IDB ─────────────────────────────────────

async function _migrate() {
  if (localStorage.getItem(MIGRATED_FLAG)) return;
  for (const key of IDB_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    try {
      const value = JSON.parse(raw);
      await _idbWrite(key, value);
      localStorage.removeItem(key);
    } catch (_) {
      // Se JSON.parse falhar (string pura), guarda como string
      try {
        await _idbWrite(key, raw);
        localStorage.removeItem(key);
      } catch (_e) {}
    }
  }
  localStorage.setItem(MIGRATED_FLAG, "1");
}

// ── API pública ───────────────────────────────────────────────────────────

/**
 * Inicializa o IDB: abre o banco, migra do localStorage, carrega cache.
 * Deve ser chamado com await antes de qualquer leitura.
 */
export async function idbInit() {
  try {
    await _openDB();
    await _migrate();
    // Pré-carrega as chaves ativas no cache síncrono
    const active = [
      "skrv_data",
      "eskrev:onep:pages:v2",
      "eskrev:onep:pages:v1",
      "eskrev:index2:page1:html",
      "skrv_mobile_notes_v1",
      "skrv_postits_v1",
    ];
    await Promise.all(
      active.map(async (key) => {
        const val = await _idbRead(key);
        if (val !== null) _cache.set(key, val);
      })
    );
  } catch (err) {
    // IDB indisponível (modo privado antigo, iOS quirk) — degradação silenciosa
    console.warn("[idb] Indisponível, operando sem persistência IDB:", err);
  }
}

/**
 * Leitura síncrona do cache (disponível após idbInit).
 * Retorna null se a chave não existir.
 */
export function idbGet(key) {
  return _cache.has(key) ? _cache.get(key) : null;
}

/**
 * Escrita fire-and-forget: atualiza cache imediatamente e persiste no IDB em background.
 */
export function idbSet(key, value) {
  _cache.set(key, value);
  _idbWrite(key, value).catch(() => {
    // Fallback: tenta localStorage se IDB falhar
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  });
}

/**
 * Remoção fire-and-forget: remove do cache e do IDB.
 */
export function idbRemove(key) {
  _cache.delete(key);
  _idbDelete(key).catch(() => {
    try { localStorage.removeItem(key); } catch (_) {}
  });
}
