/**
 * Client-side encryption for CareerGem.
 *
 * Every piece of career content (resume text, generated reports, roadmap
 * actions) is encrypted in the browser with AES-GCM. The key is derived from
 * the user's passphrase with PBKDF2 and never leaves the tab — it is not sent
 * to the server, not written to localStorage, and not recoverable by anyone
 * else. The server only ever receives opaque ciphertext.
 */

const PBKDF2_ITERATIONS = 310_000;
const VERIFIER_PLAINTEXT = "careeros.vault.v1";

function subtle(): SubtleCrypto {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Encryption is only available in the browser.");
  }
  return window.crypto.subtle;
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function generateSalt(): string {
  return toBase64(window.crypto.getRandomValues(new Uint8Array(16)));
}

export async function deriveKey(passphrase: string, saltB64: string): Promise<CryptoKey> {
  const material = await subtle().importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return subtle().deriveKey(
    {
      name: "PBKDF2",
      salt: fromBase64(saltB64) as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export type Sealed = { ciphertext: string; iv: string };

export async function seal(key: CryptoKey, value: unknown): Promise<Sealed> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const buffer = await subtle().encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    encoded as unknown as BufferSource,
  );
  return { ciphertext: toBase64(new Uint8Array(buffer)), iv: toBase64(iv) };
}

export async function open<T>(key: CryptoKey, sealed: Sealed): Promise<T> {
  const buffer = await subtle().decrypt(
    { name: "AES-GCM", iv: fromBase64(sealed.iv) as unknown as BufferSource },
    key,
    fromBase64(sealed.ciphertext) as unknown as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(buffer)) as T;
}

/** Creates the blob used to confirm a passphrase unlocks the right vault. */
export function createVerifier(key: CryptoKey): Promise<Sealed> {
  return seal(key, VERIFIER_PLAINTEXT);
}

export async function checkVerifier(key: CryptoKey, sealed: Sealed): Promise<boolean> {
  try {
    return (await open<string>(key, sealed)) === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}