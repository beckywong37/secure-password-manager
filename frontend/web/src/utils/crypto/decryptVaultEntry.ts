import { toBytes } from "./helpers";

/**
* Decrypts a vault entry using AES-GCM
* 
* References:
*   - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
*   - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt
* 
* @param {Uint8Array|string} vaultKey - same key used for encryption
* @param {Uint8Array|string} data - ciphertext (includes prepended nonce)
* @returns {Promise<string>} vault entry plaintext string
*/
export const decryptVaultEntry = async (vaultKey: Uint8Array | string, data: Uint8Array | string): Promise<string> => {
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
