**User**

Any improvements to this flow? Focus on redundancy and limit fetch requests to backend. 
Don't stray too far from current architecture and design.

**Copilot**

Used 6 references
- views.py `auth_service/views`
- authentication.py `auth_service/utils/autentication`
- SessionManager.ts `frontend/web/src/components/SessionManager`
- hasAccessToken.ts `frontend/web/src/utils/auth/hasAccessToken`
- ensureCSRFToken.ts `frontend/web/src/utils/cookies/ensureCSRFToken`
- apiRequest.ts `frontend/web/src/utils/http/apiRequest`

```typescript
import { getCookie } from "../cookies/getCookie";
import { apiRequest } from "../http/apiRequest";

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

/**
 * Helper to attempt to ensure a valid access token is available to access
 * protected resources.
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
    const session =
      options.preloadSession ??
      (await apiRequest<AuthSessionResponse>("/api/auth/session/", {
        suppressErrors: true,
      }));

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

    // No valid access token, but refresh token exists – attempt refresh
    if (session.has_refresh_token) {
      const tokenResponse = await apiRequest<{
        access?: string;
        refresh?: string;
        status?: number;
      }>("/api/auth/token/", {
        method: "POST",
        suppressErrors: true,
      });

      if (tokenResponse && tokenResponse.access) {
        // Successful refresh
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

    // No access and no refresh → definitely needs login
    return {
      authenticated: false,
      refreshed: false,
      needsLogin: true,
    };
  } catch (err) {
    return {
      authenticated: false,
      refreshed: false,
      needsLogin: true,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};
```

```typescript
import { getCookie } from "../cookies/getCookie";
import { hasAccessToken, AccessTokenResult } from "../auth/hasAccessToken";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  suppressErrors?: boolean;
}

/**
 * Reusable API request helper with optional auth.
 * - Optionally ensures valid access token via hasAccessToken()
 * - Attaches CSRF header when needed
 * - Handles query params
 * - Automatically JSON encodes/decodes when content-type is JSON
 *
 * @param {string} url - The API endpoint URL.
 * @param {ApiOptions} [options={}] - Optional request configuration.
 * @returns {Promise<T>} Resolves with the parsed JSON response (if JSON).
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    query,
    requiresAuth = false,
    suppressErrors = false,
  } = options;

  const upperMethod = method.toUpperCase() as ApiOptions["method"];
  const csrfToken = getCookie("csrftoken");
  const csrfRequired = ["POST", "PUT", "PATCH", "DELETE"];

  // Only require CSRF for unsafe methods
  if (csrfRequired.includes(upperMethod) && !csrfToken) {
    const err = new ApiError(401, "No CSRF token");
    if (suppressErrors) {
      return {
        status: err.status,
        message: err.message,
        data: null,
      } as T;
    }
    throw err;
  }

  if (requiresAuth) {
    const result: AccessTokenResult = await hasAccessToken();
    if (!result.authenticated) {
      const message = result.needsLogin
        ? "Not authenticated"
        : "Unable to verify authentication";
      const err = new ApiError(401, message, { detail: result.error });

      if (suppressErrors) {
        return {
          status: err.status,
          message: err.message,
          data: err.data,
        } as T;
      }
      throw err;
    }
  }

  // Build final URL with query parameters
  let finalUrl = url;
  if (query) {
    const params = new URLSearchParams(query);
    finalUrl = `${url}?${params.toString()}`;
  }

  // Build headers
  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    ...headers,
  };

  // Build fetch options
  const fetchOptions: RequestInit = {
    method: upperMethod,
    credentials: "include",
    headers: finalHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  // Execute request
  const response = await fetch(finalUrl, fetchOptions);

  // Parse JSON response only when content-type is JSON
  let data: any = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (suppressErrors) {
      return {
        status: response.status,
        message: response.statusText,
        data,
      } as T;
    }

    throw new ApiError(response.status, response.statusText, data);
  }

  return data as T;
}
```

```typescript
/**
 * Session Manager Component
 *
 * This component centralizes authentication and MFA routing logic.
 * It determines what the user should see based on cookies and token state.
 *
 * During MFA setup and verification, the app has not issued JWT tokens yet.
 * Instead it relies on short-lived MFA cookies. This component ensures users
 * are routed back to MFA Setup/Verify pages on reload instead of getting dumped
 * back to login prematurely.
 *
 * Flow:
 * 1. Fetch session state from /api/auth/session/.
 * 2. Ask hasAccessToken() (with preloaded session) to ensure access token:
 *    - If authenticated -> /vault
 *    - Else, check MFA cookies:
 *        - MFA verify cookie -> /mfa/verify
 *        - MFA setup cookie -> /mfa/setup
 *        - Otherwise -> /login
 */

import { useEffect, useState, type ReactNode, type FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../utils/http/apiRequest";
import {
  hasAccessToken,
  type AuthSessionResponse,
} from "../utils/auth/hasAccessToken";

// Possible authentication states
export const SessionStatus = {
  LOADING: "LOADING",
  AUTHENTICATED: "AUTHENTICATED",
  MFA_VERIFY_REQUIRED: "MFA_VERIFY_REQUIRED",
  MFA_SETUP_REQUIRED: "MFA_SETUP_REQUIRED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const SessionManager: FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(
    SessionStatus.LOADING
  );

  const navigate = useNavigate();
  const location = useLocation();

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
          preloadSession: session,
        });

        if (authenticated) {
          setSessionStatus(SessionStatus.AUTHENTICATED);
          return;
        }

        // Not authenticated with JWTs; fall back to MFA / unauthenticated state
        if (session?.has_mfa_verify_token) {
          setSessionStatus(SessionStatus.MFA_VERIFY_REQUIRED);
        } else if (session?.has_mfa_setup_token) {
          setSessionStatus(SessionStatus.MFA_SETUP_REQUIRED);
        } else {
          setSessionStatus(SessionStatus.UNAUTHENTICATED);
        }
      } catch {
        setSessionStatus(SessionStatus.UNAUTHENTICATED);
      }
    };

    checkSession();
  }, [location.key]);

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

    // If both the route and status are MFA-related, let the user stay put.
    if (statusIsMFA && userIsOnMFA) {
      return;
    }

    const targetRouteMap: Record<SessionStatus, string> = {
      [SessionStatus.UNAUTHENTICATED]: "/login",
      [SessionStatus.AUTHENTICATED]: "/vault",
      [SessionStatus.MFA_SETUP_REQUIRED]: "/mfa/setup",
      [SessionStatus.MFA_VERIFY_REQUIRED]: "/mfa/verify",
      [SessionStatus.LOADING]: location.pathname, // not used due to early return
    };

    const target = targetRouteMap[sessionStatus];

    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [sessionStatus, location.pathname, navigate]);

  // Show a loading indicator while determining the session state
  if (sessionStatus === SessionStatus.LOADING) {
    return <div>Loading...</div>;
  }

  // Render the application once the session state is known
  return <>{children}</>;
};
```