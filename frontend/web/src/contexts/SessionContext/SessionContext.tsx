// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md

import { createContext } from 'react';
import type { SessionStatus } from './SessionStatus';


export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export interface SessionContextType {
    status: SessionStatus;
}

