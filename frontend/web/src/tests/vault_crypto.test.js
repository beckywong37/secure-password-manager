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

import { describe, test, expect } from 'vitest'
import { toBytes, toHex, encryptVaultEntry, decryptVaultEntry} from '../utils/vault_crypto'

describe('toBytes', () => {
    test('leaves bytes as bytes', () => {
        const input = new Uint8Array([1, 2, 3, 4]);
        const output = toBytes(input);

        // Check output is Uint8Array
        expect(output).toBeInstanceOf(Uint8Array);

        // Check output references same input object
        expect(output).toBe(input);
    });

    test('encodes hex to bytes', () => {
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

    test('encodes regular (non-hex) string to bytes', () => {
        const input = 'Hello, world!';
        const output = toBytes(input);

        // Check output is Uint8Array
        expect(output).toBeInstanceOf(Uint8Array);

        // Check output does not reference same input object
        expect(output).not.toBe(input);

        // Check expected output value
        const expectedOutput = new TextEncoder().encode(input);
        expect([...output]).toEqual([...expectedOutput]);
    });

    test('encodes JSON to bytes', () => {
        const input = {
            "function": "toBytes",
            "test": "encode json to bytes"
        };
        const output = toBytes(input);

        // Check output is Uint8Array
        expect(output).toBeInstanceOf(Uint8Array);

        // Check output does not reference same input object
        expect(output).not.toBe(input);

        // Check expected output value
        const expectedOutput = new TextEncoder().encode(JSON.stringify(input));
        expect([...output]).toEqual([...expectedOutput]);
    });

    test('throws error for unsupported type', () => {
        const input = 1234;
        expect(() => toBytes(input)).toThrow(TypeError);
    });
});

describe('toHex', () => {
    test('leaves hex as hex', () => {
        const input = '0a1b2c3d4e';
        const output = toHex(input);

        // Check output is string
        expect(typeof output).toBe('string');

        // Check output references same input object
        expect(output).toBe(input);
    });

    test('converts bytes to hex', () => {
        const input = new Uint8Array([1, 2, 3, 4]);
        const output = toHex(input);

        // Check output is string
        expect(typeof output).toBe('string');

        // Check output does not reference same input object
        expect(output).not.toBe(input);

        // Check expected output value
        expect(output).toEqual('01020304');
    });

    test('throws error for non-hex string', () => {
        const input = '0a1b2c3d4';
        expect(() => toHex(input)).toThrow(TypeError);
    });

    test('throws error for unsupported type', () => {
        const input = {
            "function": "toHex",
            "test": "throws error"
        };
        expect(() => toHex(input)).toThrow(TypeError);
    });
});

describe('encryptVaultEntry/decryptVaultEntry', () => {
    const vaultKey = '06cf04db65c36c16cacc92a657de6bc0729da9e6b73c4342bf842bf58c434b48';
    
    test('encrypt/decrypt returns original plaintext (string)', async () => {
        const plaintext = 'P@ssw0rd!';
        const ciphertext = await encryptVaultEntry(vaultKey, plaintext);
        const decrypted = await decryptVaultEntry(vaultKey, ciphertext);

        // Check that encrypted output is of type string
        expect(typeof ciphertext).toBe('string');

        // Check that decrypting returns original plaintext input
        expect(decrypted).toBe(plaintext);
    });

    test('encrypt/decrypt returns original plaintext (object)', async () => {
        const plaintext = {
            "account": "OSU",
            "password": "P@ssw0rd!"
        };
        const ciphertext = await encryptVaultEntry(vaultKey, plaintext);
        const decrypted = await decryptVaultEntry(vaultKey, ciphertext);

        // Check that encrypted output is of type string
        expect(typeof ciphertext).toBe('string');

        // Check that decrypting returns original plaintext input
        expect(JSON.parse(decrypted)).toEqual(plaintext);
    });

    test('random nonce produces different ciphertext each time', async () => {
        const plaintext = 'P@ssw0rd!';
        const ciphertext1 = await encryptVaultEntry(vaultKey, plaintext);
        const ciphertext2 = await encryptVaultEntry(vaultKey, plaintext);

        expect(ciphertext1).not.toBe(ciphertext2);
    });

    test('decrypt fails with wrong key', async () => {
        const plaintext = 'P@ssw0rd!';
        const ciphertext = await encryptVaultEntry(vaultKey, plaintext);
        const badVaultKey = '06cf04db65c36c16cacc92a657de6bc0729da9e6b73c4342bf842bf58c434b47'; // Replaced last digit

        await expect(decryptVaultEntry(badVaultKey, ciphertext)).rejects.toThrow();
    });

    test('throws for unsupported vaultKey type', async () => {
        const plaintext = 'P@ssw0rd!';
        const unsupportedVaultKeyType = 123456;
        await expect(encryptVaultEntry(unsupportedVaultKeyType, plaintext)).rejects.toThrow(TypeError);
    });

    test('throws for unsupported data type', async () => {
        const unsupportedDataType = 12345;
        await expect(encryptVaultEntry(vaultKey, unsupportedDataType)).rejects.toThrow(TypeError);
    });

    test('decrypt fails for malformed ciphertext (no nonce)', async () => {
        const plaintext = 'P@ssw0rd!';
        const ciphertext = await encryptVaultEntry(vaultKey, plaintext);
        const corrupted = ciphertext.slice(24); // drop nonce
        await expect(decryptVaultEntry(vaultKey, corrupted)).rejects.toThrow();
    });
});
