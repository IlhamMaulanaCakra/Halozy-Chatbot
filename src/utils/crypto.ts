/**
 * Client-Side Symmetric end-to-end encryption using the browser's native Web Crypto API.
 * This guarantees zero-knowledge data security: All encryption/decryption is performed
 * locally in the sandboxed iframe. Plaintext headers, journal topics, and journal content
 * are encrypted as base64 ciphertext blocks before local storage saving and sync backup.
 * The master password never leaves the user's device.
 */

// Helper to convert ArrayBuffer <-> Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive a secure cryptographic key from an ordinary plaintext passphrase via PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string;         // Base64
  salt: string;       // Base64
}

/**
 * Encrypt a plaintext string using a client-side passphrase.
 */
export async function encryptText(
  text: string,
  passphrase?: string,
  existingSaltBase64?: string
): Promise<EncryptedData | null> {
  if (!passphrase) return null;
  try {
    const encoder = new TextEncoder();
    const dataUint = encoder.encode(text);

    // Generate random 12-byte IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Choose existing salt or generate a random 16-byte salt for PBKDF2
    const salt = existingSaltBase64
      ? new Uint8Array(base64ToArrayBuffer(existingSaltBase64))
      : window.crypto.getRandomValues(new Uint8Array(16));

    // Derive Key
    const key = await deriveKey(passphrase, salt);

    // Encrypt
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      dataUint
    );

    return {
      ciphertext: arrayBufferToBase64(ciphertextBuffer),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
    };
  } catch (error) {
    console.error("[Crypto.encryptText] Encryption failed:", error);
    throw new Error("Local cryptographic encryption failure.");
  }
}

/**
 * Decrypt a base64 ciphertext using the client-side passphrase.
 */
export async function decryptText(
  ciphertextBase64: string,
  ivBase64: string,
  saltBase64: string,
  passphrase?: string
): Promise<string> {
  if (!passphrase) {
    throw new Error("No decryption password configured.");
  }
  try {
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);
    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
    const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));

    // Derive Key
    const key = await deriveKey(passphrase, salt);

    // Decrypt
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("[Crypto.decryptText] Decryption failed:", error);
    throw new Error("Incorrect decryption passphrase. Access denied.");
  }
}
