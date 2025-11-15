**User**

Create a cookies.test.ts file for full coverage of these modules.

**Copilot**

Used 2 references
- ensureCSRFToken.ts `frontend/web/src/utils/cookies`
- getCookie.ts `frontend/web/src/utils.cokies`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getCookie } from "./getCookie";
import { ensureCSRFToken } from "./ensureCSRFToken";

describe("cookies utilities", () => {
  beforeEach(() => {
    // Reset cookie and mocks between tests
    document.cookie = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCookie", () => {
    it("returns null when cookie is not present", () => {
      document.cookie = "other=1; another=2";
      expect(getCookie("csrftoken")).toBeNull();
    });

    it("returns decoded cookie value when present", () => {
      document.cookie = "foo=bar; csrftoken=abc%20def%2Bghi; baz=1";
      expect(getCookie("csrftoken")).toBe("abc def+ghi");
    });

    it("finds cookie when it's the last item and not first", () => {
      document.cookie = "a=1; b=2; csrftoken=lastone";
      expect(getCookie("csrftoken")).toBe("lastone");
    });

    it("returns null for similarly named cookie that shouldn't match", () => {
      document.cookie = "notcsrftoken=val; csrftokenX=val2";
      expect(getCookie("csrftoken")).toBeNull();
    });
  });

  describe("ensureCSRFToken", () => {
    it("does not call fetch when csrftoken cookie exists", async () => {
      document.cookie = "csrftoken=present";
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      await ensureCSRFToken();

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("calls fetch when csrftoken cookie is missing", async () => {
      document.cookie = "";
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", fetchMock);

      await ensureCSRFToken();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/csrf/", {
        credentials: "include",
      });
    });

    it("propagates fetch rejection when fetch fails", async () => {
      document.cookie = "";
      const fetchMock = vi.fn().mockRejectedValue(new Error("network fail"));
      vi.stubGlobal("fetch", fetchMock);

      await expect(ensureCSRFToken()).rejects.toThrow("network fail");
    });
  });
});
```