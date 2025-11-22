/**
* Vault Crypto Utility Functions Tests
* 
* This module provides tests for the vault crypto utility functions.
* 
* References:
*   - https://vitest.dev/guide/
*
* Notes:
*   - To run tests locally: pnpm test
*   - To run tests locally with coverage: pnpm coverage 
*/

import { describe, it, expect } from 'vitest'
import { toBytes, toHex, isValidHex } from "../utils/crypto/helpers"
import { encryptVaultEntry, decryptVaultEntry} from '../utils/crypto'

describe('Vault Crypto Helpers', () => {
    describe(toBytes, () => {
        it('leaves bytes as bytes', () => {
            const input = new Uint8Array([1, 2, 3, 4]);
            const output = toBytes(input);

            // Check output is Uint8Array
            expect(output).toBeInstanceOf(Uint8Array);

            // Check output references same input object
            expect(output).toBe(input);
        });

        it('encodes hex to bytes', () => {
            const input = '0a1b2c3d4e';
            const output = toBytes(input);

            // Check output is Uint8Array
            expect(output).toBeInstanceOf(Uint8Array);

            // Check output does not reference same input object
            expect(output).not.toBe(input);

            // Check expected output value
            const expectedOutput = new Uint8Array([0x0a, 0x1b, 0x2c, 0x3d, 0x4e]);
            expect([...output]).toEqual([...expectedOutput]);
        });

        it('encodes regular (non-hex) string to bytes', () => {
            const input = 'Hello, world!';
            const output = toBytes(input);

            // Check output is Uint8Array (check constructor name for jsdom compatibility)
            expect(output.constructor.name).toBe('Uint8Array');

            // Check output does not reference same input object
            expect(output).not.toBe(input);

            // Check expected output value
            const expectedOutput = new TextEncoder().encode(input);
            expect([...output]).toEqual([...expectedOutput]);
        });

        it('encodes JSON to bytes', () => {
            const input = {
                "function": "toBytes",
                "test": "encode json to bytes"
            };
            const output = toBytes(input);

            // Check output is Uint8Array (check constructor name for jsdom compatibility)
            expect(output.constructor.name).toBe('Uint8Array');

            // Check output does not reference same input object
            expect(output).not.toBe(input);

            // Check expected output value
            const expectedOutput = new TextEncoder().encode(JSON.stringify(input));
            expect([...output]).toEqual([...expectedOutput]);
        });

        it('throws error for unsupported type', () => {
            const input = 1234;
            // @ts-expect-error - input is not a string or Uint8Array
            expect(() => toBytes(input)).toThrow(TypeError);
        });
    });

    describe(toHex, () => {
        it('leaves hex as hex', () => {
            const input = '0a1b2c3d4e';
            const output = toHex(input);

            // Check output is string
            expect(typeof output).toBe('string');

            // Check output references same input object
            expect(output).toBe(input);
        });

        it('converts bytes to hex', () => {
            const input = new Uint8Array([1, 2, 3, 4]);
            const output = toHex(input);

            // Check output is string
            expect(typeof output).toBe('string');

            // Check output does not reference same input object
            expect(output).not.toBe(input);

            // Check expected output value
            expect(output).toEqual('01020304');
        });

        it('throws error for non-hex string', () => {
            const input = '0a1b2c3d4';
            expect(() => toHex(input)).toThrow(TypeError);
        });

        it('throws error for unsupported type', () => {
            const input = {
                "function": "toHex",
                "test": "throws error"
            };
            // @ts-expect-error - input is not a string or Uint8Array
            expect(() => toHex(input)).toThrow(TypeError);
        });
    });

    describe(isValidHex, () => {
        it('returns true for valid lowercase hex string', () => {
            const input = '0a1b2c3d4e';
            expect(isValidHex(input)).toBe(true);
        });

        it('returns true for valid uppercase hex string', () => {
            const input = '0A1B2C3D4E';
            expect(isValidHex(input)).toBe(true);
        });

        it('returns false for odd length hex string', () => {
            const input = '0a1b2c3d4';
            expect(isValidHex(input)).toBe(false);
        });

        it('returns false for string with non-hex characters', () => {
            const input = '0a1b2c3d4z';
            expect(isValidHex(input)).toBe(false);
        });

        it('returns false for empty string', () => {
            const input = '';
            expect(isValidHex(input)).toBe(false);
        });

        it('returns false for non-string input (number)', () => {
            const input = 1234;
            // @ts-expect-error - input is not a string
            expect(isValidHex(input)).toBe(false);
        });

        it('returns false for non-string input (object)', () => {
            const input = {"hex": "0a1b2c3d4e"};
            // @ts-expect-error - input is not a string
            expect(isValidHex(input)).toBe(false);
        });

        it('returns false for non-string input (Uint8Array)', () => {
            const input = new Uint8Array([0x0a, 0x0b]);
            // @ts-expect-error - input is not a string
            expect(isValidHex(input)).toBe(false);
        });
    });
});

describe('Vault Crypto Utilities', () => {
    const vaultKey = '06cf04db65c36c16cacc92a657de6bc0729da9e6b73c4342bf842bf58c434b48';

    describe(encryptVaultEntry, () => {
        it('produces ciphertext as a string', async () => {
            const plaintext = 'P@ssw0rd!';
            const ciphertext = await encryptVaultEntry(vaultKey, plaintext);
            expect(typeof ciphertext).toBe('string');
        });

        it('produces different ciphertext each time from random nonce ', async () => {
            const plaintext = 'P@ssw0rd!';
            const ciphertext1 = await encryptVaultEntry(vaultKey, plaintext);
            const ciphertext2 = await encryptVaultEntry(vaultKey, plaintext);

            expect(ciphertext1).not.toBe(ciphertext2);
        });
        
        it('throws for unsupported vaultKey type', async () => {
            const plaintext = 'P@ssw0rd!';
            const unsupportedVaultKeyType = 123456;
            // @ts-expect-error - input is not a string or Uint8Array
            await expect(encryptVaultEntry(unsupportedVaultKeyType, plaintext)).rejects.toThrow(TypeError);
        });

        it('throws for unsupported data type', async () => {
            const unsupportedDataType = 12345;
            // @ts-expect-error - input is not a string or object
            await expect(encryptVaultEntry(vaultKey, unsupportedDataType)).rejects.toThrow(TypeError);
        });
    });

    describe(decryptVaultEntry, () => {
        it('returns original plaintext (string)', async () => {
            const plaintext = 'P@ssw0rd!';
            const ciphertext = await encryptVaultEntry(vaultKey, plaintext);
            const decrypted = await decryptVaultEntry(vaultKey, ciphertext);
            expect(decrypted).toBe(plaintext);
        });

        it('returns original plaintext (object)', async () => {
            const plaintext = {
                "account": "OSU",
                "password": "P@ssw0rd!"
            };
            const ciphertext = await encryptVaultEntry(vaultKey, plaintext);
            const decrypted = await decryptVaultEntry(vaultKey, ciphertext);
            expect(JSON.parse(decrypted)).toEqual(plaintext);
        });

        it('fails decrypt with wrong key', async () => {
            const plaintext = 'P@ssw0rd!';
            const ciphertext = await encryptVaultEntry(vaultKey, plaintext);
            const badVaultKey = '06cf04db65c36c16cacc92a657de6bc0729da9e6b73c4342bf842bf58c434b47'; // Replaced last digit
            await expect(decryptVaultEntry(badVaultKey, ciphertext)).rejects.toThrow();
        });

        it('fails decrypt for malformed ciphertext (no nonce)', async () => {
            const plaintext = 'P@ssw0rd!';
            const ciphertext = await encryptVaultEntry(vaultKey, plaintext);
            const corrupted = ciphertext.slice(24); // drop nonce
            await expect(decryptVaultEntry(vaultKey, corrupted)).rejects.toThrow();
        });
    });
});
