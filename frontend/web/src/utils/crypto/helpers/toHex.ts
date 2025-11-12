import { isValidHex } from "./isValidHex";

/**
* Helper for converting bytes to hex
* 
* References:
*   - https://chatgpt.com/share/690672d1-b4cc-8001-aad7-28ccbb57e4d1
*
* Notes:
*   - The following 2 Uint8Array methods were recently established (September 2025) to encode from bytes to hex 
*     and hex to bytes. Given their recent release, I have opted not to use them as they are only available in
*     the latest versions of browsers. This can be revisited at a later date as they mature.
*     
*     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex
*     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/setFromHex
*
* @param {string|Uint8Array} value
* @returns {string}
*/
export const toHex = (value: string | Uint8Array): string => {
    // Check if already valid hex
    if (typeof value === 'string') {
        if (isValidHex(value)) {
            return value;
        }
        throw new TypeError(`Invalid hex string`);
    }

    // Convert bytes to hex string
    if (value instanceof Uint8Array) {
        return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    throw new TypeError(`Unsupported type for toHex: ${typeof value}`);
}
