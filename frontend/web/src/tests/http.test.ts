/**
* HTTP Utility Tests
* 
* This module provides tests for the HTTP utility functions.
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
* - The conversation transcript is located in `GenAI_transcripts/2025_11_16_CopilotHTTPTests.md`
*/

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { apiRequest } from "../utils/http/apiRequest";
import * as authModule from "../utils/auth/hasAccessToken";

if (typeof (globalThis as any).document === "undefined") {
  (globalThis as any).document = { cookie: "" };
}

describe("apiRequest helper", () => {
  beforeEach(() => {
    (globalThis as any).document.cookie = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when non-GET request and csrftoken is missing", async () => {
    (globalThis as any).document.cookie = ""; // no csrftoken

    await expect(
      apiRequest("/api/do-something", { method: "POST" })
    ).rejects.toMatchObject({ status: 401, message: "No CSRF token" });
  });

  it("allows GET requests without csrftoken and returns parsed JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ pong: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiRequest("/ping", { method: "GET" });
    expect(res).toEqual({ pong: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, options] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe("/ping");
    expect((options as RequestInit).method).toBe("GET");
    expect((options as RequestInit).credentials).toBe("include");
    // No X-CSRFToken header since csrftoken missing
    const headers = (options as any).headers as Record<string, string>;
    expect(headers["X-CSRFToken"]).toBeUndefined();
  });

  it("throws when requiresAuth and hasAccessToken reports unauthenticated", async () => {
    // ensure csrftoken present for non-GET logic not to interfere
    (globalThis as any).document.cookie = "csrftoken=abc";
    const spy = vi.spyOn(authModule, "hasAccessToken").mockResolvedValue({
      authenticated: false,
      refreshed: false,
      needsLogin: true,
    });

    await expect(
      apiRequest("/protected", { requiresAuth: true })
    ).rejects.toMatchObject({ status: 401 });

    expect(spy).toHaveBeenCalled();
  });

  it("calls hasAccessToken when requiresAuth and proceeds when authenticated", async () => {
    (globalThis as any).document.cookie = "csrftoken=abc";
    const spy = vi.spyOn(authModule, "hasAccessToken").mockResolvedValue({
      authenticated: true,
      refreshed: false,
      needsLogin: false,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ secret: "ok" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiRequest("/protected", { requiresAuth: true });
    expect(res).toEqual({ secret: "ok" });
    expect(spy).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalled();
  });

  it("builds query string when query provided", async () => {
    (globalThis as any).document.cookie = "csrftoken=abc";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/items", { query: { a: "1", b: "2" } });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/items\?(?:.*a=1.*b=2|.*b=2.*a=1)/);
  });

  it("sends JSON body and includes X-CSRFToken + custom headers", async () => {
    (globalThis as any).document.cookie = "csrftoken=thetoken";
    const payload = { name: "bob" };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ created: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/create", {
      method: "post", // lowercase to test normalization
      body: payload,
      headers: { "X-Custom": "1" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify(payload));
    const headers = (options.headers || {}) as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-CSRFToken"]).toBe("thetoken");
    expect(headers["X-Custom"]).toBe("1");
  });

  it("returns null when response has no JSON body", async () => {
    (globalThis as any).document.cookie = "csrftoken=abc";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => {
        throw new Error("no json");
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiRequest("/no-json");
    expect(res).toBeNull();
  });

  it("returns structured error when suppressErrors is true and response !ok", async () => {
    (globalThis as any).document.cookie = "csrftoken=abc";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ error: "boom" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiRequest("/boom", { method: "POST", suppressErrors: true });
    expect(res).toEqual({
      status: 500,
      message: "Internal Server Error",
      data: { error: "boom" },
    });
  });

  it("throws on non-ok response when suppressErrors is false", async () => {
    (globalThis as any).document.cookie = "csrftoken=abc";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({ detail: "nope" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/forbidden", { method: "POST" })).rejects.toMatchObject({
      status: 403,
      message: "Forbidden",
      data: { detail: "nope" },
    });
  });

  it("throws 'Unable to verify authentication' when authenticated=false but needsLogin=false", async () => {
    (globalThis as any).document.cookie = "csrftoken=abc";
    vi.spyOn(authModule, "hasAccessToken").mockResolvedValue({
        authenticated: false,
        refreshed: false,
        needsLogin: false, 
    });

    await expect(
      apiRequest("/protected", { requiresAuth: true })
    ).rejects.toMatchObject({
      status: 401,
      message: "Unable to verify authentication",
    });
  });


});