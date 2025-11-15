import { type FC, type ReactNode } from 'react';
import { SessionContext, type SessionContextType } from './SessionContext';
import { SessionStatus } from './SessionStatus';

interface SessionProviderProps {
    children: ReactNode;
}

// TODO: Replace this stub with actual session management implementation
export const SessionProvider: FC<SessionProviderProps> = ({ children }) => {
    // Stubbed implementation - always unauthenticated for now
    const value: SessionContextType = {
        status: SessionStatus.UNAUTHENTICATED,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

