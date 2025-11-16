/*
GenAI Citation:
Portions of this code structure and refactoring were generated with the help of GitHub Copilot.
The conversation transcript can be found here: `GenAI_transcripts/2025_11_16_CopilotSessionsRequests.md`
*/


import { getCookie } from "../cookies/getCookie";
import { hasAccessToken, type AccessTokenResult } from "../auth/hasAccessToken";

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
* - Automatically refreshes access token (via hasAccessToken)
* - Handles CSRF token
* - Handles query params
* - Automatically JSON encodes/decodes
* @param {string} url - The API endpoint URL.
* @param {ApiOptions} [options={}] - Optional request configuration.
* @param {("GET"|"POST"|"PUT"|"PATCH"|"DELETE")} [options.method="GET"] - HTTP method.
* @param {Record<string, unknown>} [options.body] - JSON request payload.
* @param {Record<string, string>} [options.query] - Query parameters appended to the URL.
* @param {Record<string, string>} [options.headers] - Additional headers to include.
* @param {boolean} [options.requiresAuth=false] - Whether the request needs a valid JWT.
* @param {boolean} [options.suppressErrors=false] - If true, API errors are returned instead of thrown.
* @returns {Promise<T>} Resolves with the parsed JSON response.
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

  // Check for CSRF token
  const csrfToken = getCookie("csrftoken");
  if (!csrfToken && upperMethod !== "GET") {
      throw {status: 401, message: "No CSRF token"};
  }

  if (requiresAuth) {
    const result: AccessTokenResult = await hasAccessToken();
    
    // No access or refresh token, force user to re-login
    if (!result.authenticated) {
    const message = result.needsLogin ? "Not authenticated" : "Unable to verify authentication";
      throw { status: 401, message: message };
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

  // Parse JSON response
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (suppressErrors) {
      return {
        status: response.status,
        message: response.statusText,
        data,
      } as T;
    }

    throw {
      status: response.status,
      message: response.statusText,
      data,
    };
  }

  return data as T;
}
