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
if (typeof (globalThis as any).document === "undefined") {
  (globalThis as any).document = { cookie: "" };
}

describe("Auth Utilities", () => {
  beforeEach(() => {
    // Reset cookie and mocks between tests
    (globalThis as any).document.cookie = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(hasAccessToken, () => {
    it("returns true when access token is present", async () => {
      (globalThis as any).document.cookie = "accesstoken=123456789";
      expect(await hasAccessToken()).toBe(true);
    });

    it("returns false when access and refresh tokens are not present", async () => {
      expect(await hasAccessToken()).toBe(false);
    });

    it("returns false when refresh token is present but no csrf token", async () => {
      (globalThis as any).document.cookie = "refreshtoken=123456789";
      expect(await hasAccessToken()).toBe(false);
    });

    it("calls fetch when refresh token and csrftoken are present", async () => {
      (globalThis as any).document.cookie = "refreshtoken=01234; csrftoken=56789";
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetchMock);

      await hasAccessToken();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/token/", 
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": "56789"
          },
          body: JSON.stringify({refresh: "01234"})
        }
      );
    });

    it("returns true when access token is refreshed successfully", async () => {
      (globalThis as any).document.cookie = "refreshtoken=01234; csrftoken=56789";
      
      const fetchMock = vi.fn().mockImplementation(async () => {
        (globalThis as any).document.cookie = "accesstoken=new_access_token";
        return {ok: true};
      });

      vi.stubGlobal("fetch", fetchMock);

      const result = await hasAccessToken();

      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }); 

    it("returns false when fetch fails", async () => {
      (globalThis as any).document.cookie = "refreshtoken=01234; csrftoken=56789";

      const fetchMock = vi.fn().mockRejectedValue(new Error("network fail"));
      vi.stubGlobal("fetch", fetchMock);

      expect(await hasAccessToken()).toBe(false);
    });
  });
});
