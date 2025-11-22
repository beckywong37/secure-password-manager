/*
GenAI Citation:
Portions of this code structure and refactoring were generated with the help of GitHub Copilot.
The conversation transcript can be found here: `GenAI_transcripts/2025_11_16_CopilotSessionsRequests.md`
*/

import { getCookie } from "../cookies/getCookie";
import { apiRequest } from "../../utils/http/apiRequest";

export interface AuthSessionResponse {
  is_authenticated: boolean;
  has_refresh_token: boolean;
  has_mfa_setup_token: boolean;
  has_mfa_verify_token: boolean;
}

export type AccessTokenResult = {
  authenticated: boolean;
  refreshed: boolean;
  needsLogin: boolean;
  error?: string;
};

export type HasAccessTokenOptions = {
  /**
   * Optional preloaded session payload from /api/auth/session/ to avoid
   * duplicate network calls.
   */
  preloadSession?: AuthSessionResponse | null;
};


const getSession = async (options: HasAccessTokenOptions): Promise<AuthSessionResponse> => {
  if (options.preloadSession) {
    return options.preloadSession;
  }

  const {data: session} = await apiRequest<AuthSessionResponse>("/api/auth/session/", {
    suppressErrors: true,
  });

  return session;
}

/**
* Helper to attempt to ensure a valid access token is available to access protected resources.
* 
* Flow:
*  - Requires CSRF cookie (prevents refresh attempts without CSRF).
*  - If session reports is_authenticated, return authenticated.
*  - If session has_refresh_token, attempt refresh via /api/auth/token/.
*  - Otherwise, mark as needsLogin.
*
* @returns {Promise<AccessTokenResult>} details about auth state.
*/
export const hasAccessToken = async (
  options: HasAccessTokenOptions = {}
): Promise<AccessTokenResult> => {

  const csrfToken = getCookie("csrftoken");
  if (!csrfToken) {
    return {
      authenticated: false,
      refreshed: false,
      needsLogin: true,
      error: "Missing CSRF token",
    };
  }

  try {
    // Get auth status back from preloaded sessiond ata or server (uses HttpOnly cookies)
    const session = await getSession(options);

    if (!session) {
      return {
        authenticated: false,
        refreshed: false,
        needsLogin: true,
        error: "No session response",
      };
    }

    // Access token is valid
    if (session.is_authenticated) {
      return {
        authenticated: true,
        refreshed: false,
        needsLogin: false,
      };
    }

    // Has valid refresh token - attempt refresh
    if (session.has_refresh_token) {
      const {data: tokenResponse} = await apiRequest<{
        access?: string;
        refresh?: string;
        status?: number;
      }>("/api/auth/token/", {
        method: "POST",
        suppressErrors: true,
      });

      // Successful refresh attempt
      if (tokenResponse && tokenResponse.access) {
        return {
          authenticated: true,
          refreshed: true,
          needsLogin: false,
        };
      }

      // Refresh failed – treat as needing login
      return {
        authenticated: false,
        refreshed: false,
        needsLogin: true,
        error: "Token refresh failed",
      };
    }

    // No access and no refresh - needs login
    return {
      authenticated: false,
      refreshed: false,
      needsLogin: true,
    };

  } catch (err){
    return {
      authenticated: false,
      refreshed: false,
      needsLogin: true,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};
