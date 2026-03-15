// src/js/modules/crypto_manager.js
// Authoria — ECDSA P-256 signing for .skv files
//
// Fluxo:
//   1. generateAuthorKey(password) → gera par de chaves, cifra privada, salva em IndexedDB
//   2. signContent(contentHash, password) → assina hash com chave privada
//   3. exportPublicCert() → retorna JWK da chave pública (para download .authoria-pub.json)
//   4. hasKey() → verifica se chave já existe
//   5. verifySignature(signatureB64, publicKeyJwk, contentHash) → verifica assinatura

const DB_NAME = "authoria-keys";
const DB_VERSION = 1;
const STORE_NAME = "keys";
const KEY_ID = "author-signing-key";
const PBKDF2_ITERATIONS = 200_000;

// ── IndexedDB helpers ────────────────────────────────────────────────────────

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(db, record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Crypto primitives ────────────────────────────────────────────────────────

function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b64ToBuf(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function deriveWrappingKey(password, salt) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["wrapKey", "unwrapKey"]
  );
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Gera par de chaves ECDSA P-256, cifra a privada com a senha do usuário
 * e salva em IndexedDB. Retorna a chave pública como JWK.
 *
 * @param {string} password
 * @returns {Promise<object>} publicKeyJwk
 */
export async function generateAuthorKey(password) {
  if (!password || password.length < 8) {
    throw new Error("A senha deve ter pelo menos 8 caracteres.");
  }

  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true, // extractable
    ["sign", "verify"]
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrappingKey = await deriveWrappingKey(password, salt);

  const encryptedPrivateKey = await crypto.subtle.wrapKey(
    "jwk",
    keyPair.privateKey,
    wrappingKey,
    { name: "AES-GCM", iv }
  );

  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

  const db = await openDb();
  await dbPut(db, {
    id: KEY_ID,
    salt: bufToB64(salt),
    iv: bufToB64(iv),
    encryptedPrivateKey: bufToB64(encryptedPrivateKey),
    publicKeyJwk,
    createdAt: new Date().toISOString(),
  });
  db.close();

  return publicKeyJwk;
}

/**
 * Verifica se já existe uma chave de autor gerada.
 * @returns {Promise<boolean>}
 */
export async function hasKey() {
  try {
    const db = await openDb();
    const record = await dbGet(db, KEY_ID);
    db.close();
    return !!record;
  } catch (_) {
    return false;
  }
}

/**
 * Retorna a chave pública JWK armazenada (sem precisar de senha).
 * @returns {Promise<object|null>}
 */
export async function getPublicKeyJwk() {
  try {
    const db = await openDb();
    const record = await dbGet(db, KEY_ID);
    db.close();
    return record ? record.publicKeyJwk : null;
  } catch (_) {
    return null;
  }
}

/**
 * Assina um hash de conteúdo com a chave privada do autor.
 * Requer a senha para descriptografar a chave privada.
 *
 * @param {string} contentHash  — hex string (SHA-256 do texto)
 * @param {string} password
 * @returns {Promise<{ signature: string, publicKeyJwk: object, signed_at: string }>}
 */
export async function signContent(contentHash, password) {
  const db = await openDb();
  const record = await dbGet(db, KEY_ID);
  db.close();

  if (!record) throw new Error("Nenhuma chave de autor encontrada. Gere uma chave primeiro.");

  const salt = b64ToBuf(record.salt);
  const iv = b64ToBuf(record.iv);
  const encBuf = b64ToBuf(record.encryptedPrivateKey);

  let wrappingKey;
  try {
    wrappingKey = await deriveWrappingKey(password, salt);
  } catch (_) {
    throw new Error("Erro ao processar senha.");
  }

  let privateKey;
  try {
    privateKey = await crypto.subtle.unwrapKey(
      "jwk",
      encBuf,
      wrappingKey,
      { name: "AES-GCM", iv },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );
  } catch (_) {
    throw new Error("Senha incorreta ou chave corrompida.");
  }

  const data = new TextEncoder().encode(contentHash);
  const sigBuf = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    data
  );

  return {
    signature: bufToB64(sigBuf),
    publicKeyJwk: record.publicKeyJwk,
    signed_at: new Date().toISOString(),
  };
}

/**
 * Verifica uma assinatura Authoria.
 * Pode ser usada sem chave local — só precisa da publicKeyJwk e assinatura do arquivo.
 *
 * @param {string} signatureB64    — base64 da assinatura
 * @param {object} publicKeyJwk    — JWK da chave pública do autor
 * @param {string} contentHash     — hex string SHA-256 do texto a verificar
 * @returns {Promise<boolean>}
 */
export async function verifySignature(signatureB64, publicKeyJwk, contentHash) {
  try {
    const pubKey = await crypto.subtle.importKey(
      "jwk",
      publicKeyJwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );
    const sigBuf = b64ToBuf(signatureB64);
    const data = new TextEncoder().encode(contentHash);
    return crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      pubKey,
      sigBuf,
      data
    );
  } catch (_) {
    return false;
  }
}

/**
 * Exporta o certificado público (para download como .authoria-pub.json).
 * @returns {Promise<object|null>}
 */
export async function exportPublicCert() {
  const jwk = await getPublicKeyJwk();
  if (!jwk) return null;
  return {
    type: "authoria-public-key",
    version: "1.0",
    algorithm: "ECDSA-P256",
    key: jwk,
    note: "Chave pública do autor. Use no Authoria para verificar assinaturas de arquivos .skv.",
  };
}
