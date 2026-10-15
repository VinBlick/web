import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { apiRequest, ApiError, setAccessToken } from "../src/shared/api/client";

const originalFetch = globalThis.fetch;
const originalBase = process.env.NEXT_PUBLIC_API_BASE_URL;
afterEach(() => {
  globalThis.fetch = originalFetch;
  setAccessToken(null);
  if (originalBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = originalBase;
});

test("does not make a request when the backend is unconfigured", async () => {
  delete process.env.NEXT_PUBLIC_API_BASE_URL;
  globalThis.fetch = async () => {
    throw new Error("Must not fetch");
  };
  await assert.rejects(
    apiRequest("/checks"),
    (error: unknown) => error instanceof ApiError && error.status === 503,
  );
});

test("sends JSON with credentials, bearer token and order access", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test/v1/";
  setAccessToken("tok");
  globalThis.fetch = async (url, init) => {
    const headers = new Headers(init?.headers);
    assert.equal(url, "https://api.example.test/v1/orders");
    assert.equal(init?.credentials, "include");
    assert.equal(headers.get("Content-Type"), "application/json");
    assert.equal(headers.get("Authorization"), "Bearer tok");
    assert.equal(headers.get("X-Order-Access"), "abc");
    assert.equal(init?.body, JSON.stringify({ a: 1 }));
    return new Response(null, { status: 204 });
  };
  assert.equal(
    await apiRequest("/orders", {
      method: "POST",
      body: { a: 1 },
      orderAccess: "abc",
    }),
    undefined,
  );
});

test("GET requests carry no JSON content type", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test/v1";
  globalThis.fetch = async (_url, init) => {
    assert.equal(new Headers(init?.headers).get("Content-Type"), null);
    return Response.json({ ok: true });
  };
  assert.deepEqual(await apiRequest("/packages"), { ok: true });
});

test("refreshes an expired access token once and retries", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test/v1";
  setAccessToken("old");
  const calls: string[] = [];
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    calls.push(`${u} ${new Headers(init?.headers).get("Authorization") ?? ""}`);
    if (u.endsWith("/auth/refresh-token"))
      return Response.json({ accessToken: "new" });
    const auth = new Headers(init?.headers).get("Authorization");
    return auth === "Bearer new"
      ? Response.json({ user: { id: "1" } })
      : new Response(null, { status: 401 });
  };
  assert.deepEqual(await apiRequest("/user/current"), { user: { id: "1" } });
  assert.equal(calls.length, 3);
});

test("maps backend error codes and reasons to German messages", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test/v1";
  globalThis.fetch = async () =>
    Response.json(
      { code: "BadRequest", message: "x", details: { reason: "EXPIRED" } },
      { status: 400 },
    );
  await assert.rejects(
    apiRequest("/orders"),
    (e: unknown) => e instanceof ApiError && e.message.includes("abgelaufen"),
  );
  globalThis.fetch = async () =>
    Response.json(
      { code: "ValidationError", errors: { email: { msg: "Invalid" } } },
      { status: 400 },
    );
  await assert.rejects(
    apiRequest("/auth/sign-up"),
    (e: unknown) => e instanceof ApiError && e.fieldErrors?.email === "Invalid",
  );
  globalThis.fetch = async () => new Response("oops", { status: 502 });
  await assert.rejects(
    apiRequest("/x"),
    (e: unknown) => e instanceof ApiError && e.code === "ServerError",
  );
});
