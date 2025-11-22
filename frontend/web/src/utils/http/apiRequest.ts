/*
GenAI Citation:
Portions of this code structure and refactoring were generated with the help of GitHub Copilot.
The conversation transcript can be found here: `GenAI_transcripts/2025_11_16_CopilotSessionsRequests.md`
*/


import { getCookie } from "../cookies/getCookie";

interface ApiOptions<TBody = unknown> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  suppressErrors?: boolean;
}

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}

/**
* Reusable API request helper with optional auth.
* - Automatically refreshes access token (via hasAccessToken)
* - Handles CSRF token
* - Handles query params
* - Automatically JSON encodes/decodes* 
*/
export async function apiRequest<T = unknown, TBody = unknown>(
  url: string,
  options: ApiOptions<TBody> = {}
): Promise<ApiResponse<T>> {
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
    const accessToken = getCookie("accesstoken");
    headers["Authorization"] = `Bearer ${accessToken}`;
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
  let data: unknown = null;
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
      } as ApiResponse<T>;
    }

    throw {
      status: response.status,
      message: response.statusText,
      data,
    };
  }

  return {
    status: response.status,
    message: response.statusText,
    data,
  } as ApiResponse<T>;
}
