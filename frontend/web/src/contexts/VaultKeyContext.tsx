import { createContext } from 'react';

interface VaultKeyContextType {
  vaultKey: Uint8Array | null;
  setVaultKey: (key: string | Uint8Array | null) => void;
  clearVaultKey: () => void;
}

export const VaultKeyContext = createContext<VaultKeyContextType | undefined>(undefined);
