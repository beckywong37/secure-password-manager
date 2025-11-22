/**
 * GenAI Citation for April:
 * Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
 * The conversation in the file below documents the GenAI Interaction that led to my code.
 * ../GenAI_transcripts/2025_11_21_Cursor_Vault_Encrypt_Decrypt.md
 * 
 * VaultKeyContext
 * 
 * Provides secure in-memory storage for the user's vault key during their session.
 * The vault key is derived from the master password and returned by the backend
 * after successful MFA verification.
 * 
 * Security notes:
 * - Vault key is stored only in memory (React state)
 * - Never persisted to localStorage or sessionStorage
 * - Cleared on logout or page refresh
 */

import { useState, type ReactNode } from 'react';
import { VaultKeyContext } from './VaultKeyContext';
import { toBytes } from '../utils/crypto/helpers/toBytes';

interface VaultKeyProviderProps {
  children: ReactNode;
}

export const VaultKeyProvider = ({ children }: VaultKeyProviderProps) => {
  const [vaultKey, setVaultKeyState] = useState<Uint8Array | null>(null);

  const setVaultKey = (key: string | Uint8Array | null) => {
    if (key === null) {
      setVaultKeyState(null);
      return;
    }
    
    // Convert hex string to Uint8Array if needed
    if (typeof key === 'string') {
      setVaultKeyState(toBytes(key));
    } else {
      setVaultKeyState(key);
    }
  };

  const clearVaultKey = () => {
    setVaultKeyState(null);
  };

  return (
    <VaultKeyContext.Provider value={{ vaultKey, setVaultKey, clearVaultKey }}>
      {children}
    </VaultKeyContext.Provider>
  );
};


