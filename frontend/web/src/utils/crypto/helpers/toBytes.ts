import { isValidHex } from "./isValidHex";

/**
* Helper for UTF-8 encoding of text or JSON
* 
* References:
*   - Inspiration: https://stackoverflow.com/a/69980864
*
* Notes:
*   - The following 2 Uint8Array methods were recently established (September 2025) to encode from bytes to hex 
*     and hex to bytes. Given their recent release, I have opted not to use them as they are only available in
*     the latest versions of browsers. This can be revisited at a later date as they mature.
*     
*     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex
*     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/setFromHex
*
* @param {string|Uint8Array|object} value
* @returns {Uint8Array} 
*/
export const toBytes = (value: string | Uint8Array | object): Uint8Array => {
    if (value instanceof Uint8Array) return value;

    if (typeof value === 'string') {
        // Check if string is valid hex (even length and only hex chars)
        if (isValidHex(value)) {
            // Use regex to chunk into byte pairs, then map to numbers
            const pairs = value.match(/.{2}/g)!;  // non-null assertion because isValidHex guarantees match
            const bytes = pairs.map((pair) => parseInt(pair, 16));
            return new Uint8Array(bytes);
        }

        // Otherwise treat as UTF-8 string
        return new TextEncoder().encode(value);
    }

    if (typeof value === 'object') {
        return new TextEncoder().encode(JSON.stringify(value));
    }

    throw new TypeError(`Unsupported type for toBytes: ${typeof value}`);
}
