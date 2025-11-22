/**
 * Session Manager Component
 *
 * This component centralizes authentication and MFA routing logic.
 * It determines what the user should see based on cookies and token state.
 * 
 * During MFA setup and verification, the app has not issued JWT tokens yet.
 * Instead it relies on short-lived MFA cookies. This compponent ensures users
 * are routed back to MFA Setup/Verify pages on reload instead of getting dumped
 * back to login prematurely.
 *
 * Flow:
 * 1. Fetch session state from /api/auth/session/.
 * 2. Ask hasAccessToken() (with preloaded session) to ensure access token:
 *   - If authenticated > > /vault
 *   - Else, check MFA cookies:
 *     - MFA verify cookie > /mfa-verify
 *     - MFA setup cookie > /mfa-setup
 *     - Otherwise > /login
 * 
 * GenAI Citation:
 * Portions of this code structure and refactoring were generated with the help of GitHub Copilot.
 * The conversation transcript can be found here: `GenAI_transcripts/2025_11_16_CopilotSessionsRequests.md`
 */

import { useEffect, useState, type ReactNode, type FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../../utils/http/apiRequest";
import {hasAccessToken, type AuthSessionResponse } from "../../utils/auth/hasAccessToken";
import { useVaultKey } from '../../contexts/useVaultKey';
import { SessionStatus } from "./SessionStatus";
import { SessionContext } from "./SessionContext";
import type { SessionContextType } from "./SessionContext";

export const SessionManager: FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(
    SessionStatus.LOADING
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { clearVaultKey } = useVaultKey();

  /**
   * Evaluate server-side session + tokens whenever the route changes.
   * This uses a single /session/ call and passes the result into hasAccessToken
   * to avoid duplicate calls.
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await apiRequest<AuthSessionResponse>(
          "/api/auth/session/",
          { suppressErrors: true }
        );

        // First, see if we can establish a valid access token (or refresh)
        const { authenticated } = await hasAccessToken({
          preloadSession: session.data,
        });

        if (authenticated) {
          setSessionStatus(SessionStatus.AUTHENTICATED);
          return;
        }

        // Not authenticated with JWTs; fall back to MFA / unauthenticated state
        if (session.data?.has_mfa_verify_token) {
          setSessionStatus(SessionStatus.MFA_VERIFY_REQUIRED);
        } else if (session.data?.has_mfa_setup_token) {
          setSessionStatus(SessionStatus.MFA_SETUP_REQUIRED);
        } else {
          setSessionStatus(SessionStatus.UNAUTHENTICATED);
          clearVaultKey(); // Clear vault key when session becomes unauthenticated
        }
      } catch {
        setSessionStatus(SessionStatus.UNAUTHENTICATED);
        clearVaultKey(); // Clear vault key on session check failure
      }
    };
    checkSession();
  }, [location.key, clearVaultKey])

  /**
   * Navigation logic based on current session status.
   * Uses a simple route map + MFA allowance rule.
   */
  useEffect(() => {
    if (sessionStatus === SessionStatus.LOADING) return;

    const userIsOnMFA = 
      location.pathname.startsWith("/mfa/setup") || 
      location.pathname.startsWith("/mfa/verify");

    const statusIsMFA =
      sessionStatus === SessionStatus.MFA_SETUP_REQUIRED ||
      sessionStatus === SessionStatus.MFA_VERIFY_REQUIRED;

    // If both the route and status are MFA-related, let the user stay
    if (userIsOnMFA && statusIsMFA) return;

    // For authenticated users, only redirect if they're on auth-related routes
    if (sessionStatus === SessionStatus.AUTHENTICATED) {
      const isOnAuthRoute = 
        location.pathname === "/login" || 
        location.pathname === "/" ||
        location.pathname.startsWith("/mfa/");
      
      if (isOnAuthRoute) {
        navigate("/vault", { replace: true });
      }
      return;
    }

    // For unauthenticated and MFA states, use the target route map
    const targetRouteMap: Record<SessionStatus, string> = {
      [SessionStatus.UNAUTHENTICATED]: "/login",
      [SessionStatus.MFA_SETUP_REQUIRED]: "/mfa/setup",
      [SessionStatus.MFA_VERIFY_REQUIRED]: "/mfa/verify",
      [SessionStatus.AUTHENTICATED]: "/vault", // fallback (not used due to above check)
      [SessionStatus.LOADING]: location.pathname, // not used due to early return
    };

    const target = targetRouteMap[sessionStatus];

    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [sessionStatus, location.pathname, navigate]);

  // Prepare context value
  const contextValue: SessionContextType = {
    status: sessionStatus,
  };

  // Show a loading indicator while determining the session state
  if (sessionStatus === SessionStatus.LOADING) {
    return <div>Loading...</div>;
  }

  // Render the application once the session state is known, providing session context
  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};
