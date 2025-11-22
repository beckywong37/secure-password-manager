import { useContext } from 'react';
import { VaultKeyContext } from './VaultKeyContext';


export const useVaultKey = () => {
    const context = useContext(VaultKeyContext);
    if (context === undefined) {
        throw new Error('useVaultKey must be used within a VaultKeyProvider');
    }
    return context;
};
