/**
* Vault Crypto Utility Functions 
* 
* This module provides functions to encrypt and decrypt vault entries using AES-GCM and the
* vault key derived on the server during user authentication.
* 
* References:
*   - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
*   - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
*   - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt
*   - https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
*   - Hex to bytes inspiration: https://stackoverflow.com/a/69980864
*   - Bytes to hex: https://chatgpt.com/share/690672d1-b4cc-8001-aad7-28ccbb57e4d1
*
* Notes:
*   - The following 2 Uint8Array methods were recently established (September 2025) to encode from bytes to hex 
*     and hex to bytes. Given their recent release, I have opted not to use them as they are only available in
*     the latest versions of browsers. This can be revisited at a later date as they mature.
*     
*     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex
*     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/setFromHex
*/

/**
* Helper for UTF-8 encoding of text or JSON
* See reference listed above
* @param {string|Uint8Array|object} value
* @returns {Uint8Array} 
*/
export function toBytes(value) {
    if (value instanceof Uint8Array) return value;

    if (typeof value === 'string') {
        // Check if string is valid hex (even length and only hex chars)
        const hexRegex = /^[0-9a-fA-F]+$/;
        if (hexRegex.test(value) && value.length % 2 === 0) {
            const bytes = new Uint8Array(value.length / 2);
            for (let i = 0; i < value.length; i += 2) {
                bytes[i / 2] = parseInt(value.slice(i, i + 2), 16);
            }
            return bytes;
        }

        // Otherwise treat as UTF-8 string
        return new TextEncoder().encode(value);
    }

    if (typeof value === 'object') {
        return new TextEncoder().encode(JSON.stringify(value));
    }

    throw new TypeError(`Unsupported type for toBytes: ${typeof value}`);
}

/**
* Helper for converting bytes to hex
* See reference listed above
* @param {string|Uint8Array} value
* @returns {string}
*/
export function toHex(value) {
    // Check if already valid hex
    if (typeof value === 'string') {
        const hexRegex = /^[0-9a-fA-F]+$/;
        if (hexRegex.test(value) && value.length % 2 === 0) {
            return value;
        }
        throw new TypeError(`Invalid hex string`);
    }

    if (value instanceof Uint8Array) {
        let hex = '';
        for (let i = 0; i < value.length; i++) {
            const bytes = value[i];
            hex += (bytes < 16 ? '0' : '') + bytes.toString(16);
        }
        return hex;
    }

    throw new TypeError(`Unsupported type for toHex: ${typeof value}`);
}

/**
* Encrypt a vault entry using AES-GCM
* @param {Uint8Array|string} vaultKey - 256-bit key (raw bytes)
* @param {string|object} data - plaintext data
* @returns {Promise<string>} ciphertext hex-encoded string (includes prepended nonce) 
*/
export async function encryptVaultEntry(vaultKey, data) {
    const key = await crypto.subtle.importKey(
        'raw',
        toBytes(vaultKey),
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
        toBytes(data)
    );

    // Pack nonce and ciphertext together into single Uint8Array
    const ciphertext = new Uint8Array(nonce.length + encrypted.byteLength);   // create buffer large enough for both
    ciphertext.set(nonce, 0);   // set nonce starting at byte 0
    ciphertext.set(new Uint8Array(encrypted), nonce.length);    // set ciphertext after nonce

    return toHex(ciphertext);
}

/**
* Decrypt a vault entry using AES-GCM
* @param {Uint8Array|string} vaultKey - same key used for encryption
* @param {Uint8Array|string} data - ciphertext (includes prepended nonce)
* @returns {Promise<string>} vault entry plaintext string
*/
export async function decryptVaultEntry(vaultKey, data) {
    const key = await crypto.subtle.importKey(
        'raw',
        toBytes(vaultKey),
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
    );

    // Convert to bytes if needed
    data = toBytes(data);

    // Unpack nonce and ciphertext
    const nonce = data.slice(0, 12);        // first 12 bytes is nonce
    const ciphertext = data.slice(12);      // rest of bytes is ciphertext

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: nonce
        },
        key,
        ciphertext
    );

    return new TextDecoder().decode(decrypted);
}
