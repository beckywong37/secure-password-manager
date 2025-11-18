import { createContext } from "react";
import type { SessionStatus } from "./SessionStatus";

// Context types

export interface SessionContextType {
  status: SessionStatus;
}
// Create context
export const SessionContext = createContext<SessionContextType | undefined>(undefined);
