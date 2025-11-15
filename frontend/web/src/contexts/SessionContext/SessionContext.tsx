import { createContext } from 'react';
import type { SessionStatus } from './SessionStatus';


export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export interface SessionContextType {
    status: SessionStatus;
}

