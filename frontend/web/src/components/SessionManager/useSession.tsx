import { useContext } from "react";
import { SessionContext } from "./SessionContext";

// Hook to use session context

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionManager');
  }
  return context;
};
