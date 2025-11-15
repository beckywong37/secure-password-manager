import { toBytes, toHex } from "./helpers";

/**
* Encrypts a vault entry using AES-GCM
* 
* References:
*   - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
*   - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
*   - https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
*
* @param {Uint8Array|string} vaultKey - 256-bit key (raw bytes)
* @param {string|object} data - plaintext data
* @returns {Promise<string>} ciphertext hex-encoded string (includes prepended nonce) 
*/
export const encryptVaultEntry = async (vaultKey: Uint8Array | string, data: string | object): Promise<string> => {
    const key = await crypto.subtle.importKey(
        'raw',
        toBytes(vaultKey).buffer as ArrayBuffer,
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
    );

    const nonce = crypto.getRandomValues(new Uint8Array(12));  // 96 bits

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: nonce
        },
        key,
        toBytes(data).buffer as ArrayBuffer
    );

    // Pack nonce and ciphertext together into single Uint8Array
    const ciphertext = new Uint8Array(nonce.length + encrypted.byteLength);   // create buffer large enough for both
    ciphertext.set(nonce, 0);   // set nonce starting at byte 0
    ciphertext.set(new Uint8Array(encrypted), nonce.length);    // set ciphertext after nonce

    return toHex(ciphertext);
}
