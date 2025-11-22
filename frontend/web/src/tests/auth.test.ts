// @vitest-environment jsdom
/**
* Auth Utility Tests
* 
* This module provides tests for the auth utility functions.
* 
* References:
*   - https://vitest.dev/guide/
*
* Notes:
*   - To run tests locally: pnpm test
*   - To run tests locally with coverage: pnpm coverage 
* 
* GenAI Citation:
* - These tests were modeled after the tests in `frontend/web/src/tests/cookies.test.ts`, 
*   which were generated with help from GitHub Copilot, as previously sited.
*/

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { hasAccessToken } from "../utils/auth";

// Ensure a minimal document implementation for Node (vitest) so document.cookie is available


describe("Auth Utilities", () => {
  beforeEach(() => {
    // Reset cookie and mocks between tests
    globalThis.document.cookie = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(hasAccessToken, () => {
    it("returns unauthenticated when access token exists but no CSRF token", async () => {
      globalThis.document.cookie = "accesstoken=123456789";
      
      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: false,
        refreshed: false,
        needsLogin: true,
        error: "Missing CSRF token"
      });
    });

    it("returns unauthenticated when no access, refresh, or CSRF token exists", async () => {
      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: false,
        refreshed: false,
        error: "Missing CSRF token",
        needsLogin: true
      });
    });

    it("returns unauthenticated when refresh token exists but no CSRF token", async () => {
      globalThis.document.cookie = "refreshtoken=123456789";
      
      const result = await hasAccessToken();
      
      expect(result).toEqual({
        authenticated: false,
        refreshed: false,
        needsLogin: true,
        error: "Missing CSRF token"
      });
    });

    it("calls /api/auth/session/ first when refresh + CSRF exist", async () => {
      globalThis.document.cookie = "refreshtoken=01234; csrftoken=56789";
      const fetchMock = vi.fn().mockResolvedValue({ ok: true , json: async () => ({})});
      vi.stubGlobal("fetch", fetchMock);

      await hasAccessToken();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/session/", 
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": "56789"
          }
        }
      );
    });

    it("returns unauthenticated when no access token but refresh token present", async () => {
      globalThis.document.cookie = "refreshtoken=01234; csrftoken=56789";
      
      const fetchMock = vi.fn().mockImplementation(async () => {
        globalThis.document.cookie = "accesstoken=new_access_token";
        return {ok: true, json: async () => ({})};
      });

      vi.stubGlobal("fetch", fetchMock);

      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: false,
        refreshed: false,
        needsLogin: true
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
    }); 

    it("returns unauthenticated when fetch() throws an error", async () => {
      globalThis.document.cookie = "refreshtoken=01234; csrftoken=56789";

      const fetchMock = vi.fn().mockRejectedValue(new Error("network fail"));
      vi.stubGlobal("fetch", fetchMock);

      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: false,
        refreshed: false,
        needsLogin: true,
        error: "network fail"
      });
    });

    it("returns unauthenticated when refresh endpoint responds with !ok", async () => {
      globalThis.document.cookie = "refreshtoken=01234; csrftoken=56789";

      const fetchMock = vi.fn().mockResolvedValue({ok: false, json: async () => ({ detail: "invalid refresh" })});
      vi.stubGlobal("fetch", fetchMock);

      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: false,
        refreshed: false,
        needsLogin: true,
      });
    });

    it("returns unauthenticated when session response is null", async () => {
      globalThis.document.cookie = "refreshtoken=01234; csrftoken=56789";

      // Mock apiRequest directly, bypassing fetch → suppressErrors logic
      const apiMock = vi.spyOn(await import("../utils/http/apiRequest"), "apiRequest");
      apiMock.mockResolvedValueOnce({data: null, status: 200, message: "No session response"});  // session = null

      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: false,
        refreshed: false,
        needsLogin: true,
        error: "No session response",
      });

      apiMock.mockRestore();
    });

    it("returns Unknown error when a non-Error value is thrown", async () => {
      globalThis.document.cookie = "csrftoken=foo"; // allow flow into try {}

      // Force the try block to throw a non-Error value
      const fetchMock = vi.fn().mockImplementation(() => {
        throw 123;   // Not an instance of Error
      });

      vi.stubGlobal("fetch", fetchMock);

      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: false,
        refreshed: false,
        needsLogin: true,
        error: "Unknown error",
      });
    });

    it("returns authenticated when session indicates authentication", async () => {
      globalThis.document.cookie = "refreshtoken=01234; csrftoken=56789";

      const fetchMock = vi.fn().mockResolvedValue({ok: true, json: async () => ({ is_authenticated: true })});
      vi.stubGlobal("fetch", fetchMock);

      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: true,
        refreshed: false,
        needsLogin: false,
      });
    });

    it("returns authenticated and refreshed when refresh succeeds", async () => {
      globalThis.document.cookie = "csrftoken=56789";

      const fetchMock = vi.fn()
        // Call to session endpoint
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            is_authenticated: false,
            has_refresh_token: true
          })
        })
        // Call to token refresh endpoint
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access: "new_access_token" })
        });

      vi.stubGlobal("fetch", fetchMock);

      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: true,
        refreshed: true,
        needsLogin: false
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("returns error when refresh token attempt fails", async () => {
      globalThis.document.cookie = "csrftoken=56789";

      const fetchMock = vi.fn()
        // Call to session endpoint
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            is_authenticated: false,
            has_refresh_token: true
          })
        })
        // Call to token refresh endpoint
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        });

      vi.stubGlobal("fetch", fetchMock);

      const result = await hasAccessToken();

      expect(result).toEqual({
        authenticated: false,
        refreshed: false,
        needsLogin: true,
        error: "Token refresh failed"
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
