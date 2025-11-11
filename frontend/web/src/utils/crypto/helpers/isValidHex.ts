const HEX_REGEX = /^[0-9a-fA-F]+$/;

/**
* Helper to check whether a string is a valid hexadecimal sequence.
* 
* @param {string} value
* @returns {boolean} true if the string is valid hex (even length and only 0–9, a–f, A–F), otherwise false.
*/
export const isValidHex = (value: string): boolean => {
    if (typeof value !== 'string') return false;
    return HEX_REGEX.test(value) && value.length % 2 === 0;
}