/**
* Cookies Utility Tests
* 
* This module provides tests for the cookies utility functions.
* 
* References:
*   - https://vitest.dev/guide/
*
* Notes:
*   - To run tests locally: pnpm test
*   - To run tests locally with coverage: pnpm coverage 
* 
* GenAI Citation:
* - These tests were generated with help from GitHub Copilot prior to review and modifications.
* - The conversation transcript is located in `GenAI_transcripts/2025_11_14_CopilotCookiesTests.md`
*/

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getCookie, ensureCSRFToken } from "../utils/cookies";

// Ensure a minimal document implementation for Node (vitest) so document.cookie is available
if (typeof (globalThis as any).document === "undefined") {
  (globalThis as any).document = { cookie: "" };
}

describe("Cookies Utilities", () => {
  beforeEach(() => {
    // Reset cookie and mocks between tests
    (globalThis as any).document.cookie = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(getCookie, () => {
    it("returns null when cookie is not present", () => {
      (globalThis as any).document.cookie = "cookie1=1; cookie2=2";
      expect(getCookie("csrftoken")).toBeNull();
    });

    it("returns decoded cookie value when present", () => {
      (globalThis as any).document.cookie = "firstcookie=first; csrftoken=abc%20def%2Bghi; lastcookie=last";
      expect(getCookie("csrftoken")).toBe("abc def+ghi");
    });

    it("finds cookie when it's the last item", () => {
      (globalThis as any).document.cookie = "a=1; b=2; csrftoken=lastone";
      expect(getCookie("csrftoken")).toBe("lastone");
    });

    it("returns null for similarly named cookie that doesn't match", () => {
      (globalThis as any).document.cookie = "notcsrftoken=val; csrftokenX=val2";
      expect(getCookie("csrftoken")).toBeNull();
    });
  });

  describe(ensureCSRFToken, () => {
    it("does not call fetch when csrftoken cookie exists", async () => {
      (globalThis as any).document.cookie = "csrftoken=present";
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      await ensureCSRFToken();

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("calls fetch when csrftoken cookie is missing", async () => {
      (globalThis as any).document.cookie = "";
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetchMock);

      await ensureCSRFToken();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/csrf/", {
        credentials: "include",
      });
    });

    it("propagates fetch rejection when fetch fails", async () => {
      (globalThis as any).document.cookie = "";
      const fetchMock = vi.fn().mockRejectedValue(new Error("network fail"));
      vi.stubGlobal("fetch", fetchMock);

      await expect(ensureCSRFToken()).rejects.toThrow("network fail");
    });
  });
});
