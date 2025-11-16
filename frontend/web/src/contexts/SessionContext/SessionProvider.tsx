// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md

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

