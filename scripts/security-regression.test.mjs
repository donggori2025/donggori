import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createFactorySessionValue, verifyFactorySessionValue } from "../lib/factorySession.ts";
import { canAccessMatchRequest } from "../lib/matchRequestAuth.ts";
import { createOAuthState, verifyOAuthState } from "../lib/oauthState.ts";

test("factory session rejects unsigned and tampered values", () => {
  assert.equal(verifyFactorySessionValue('{"factoryId":"1"}'), null);
  const signed = createFactorySessionValue({ factoryId: "1", factoryName: "A", username: "factory01" });
  assert.equal(verifyFactorySessionValue(signed)?.factoryId, "1");
  assert.equal(verifyFactorySessionValue(`${signed}x`), null);
});

test("match request access is limited to the owner or admin", () => {
  const row = { user_id: "user-1", user_email: "a@example.com", factory_id: "factory-1" };
  assert.equal(canAccessMatchRequest({ authenticated: true, role: "user", userId: "user-1" }, row), true);
  assert.equal(canAccessMatchRequest({ authenticated: true, role: "user", userId: "user-2" }, row), false);
  assert.equal(canAccessMatchRequest({ authenticated: true, role: "factory", userId: "factory-1" }, row), true);
  assert.equal(canAccessMatchRequest({ authenticated: true, role: "factory", userId: "factory-2" }, row), false);
  assert.equal(canAccessMatchRequest({ authenticated: true, role: "admin" }, row), true);
});

test("OAuth state must match the server cookie", () => {
  const state = createOAuthState();
  assert.equal(verifyOAuthState(state, state), true);
  assert.equal(verifyOAuthState(`${state}x`, state), false);
  assert.equal(verifyOAuthState(null, state), false);
});

test("critical auth bypasses stay removed", async () => {
  const [auth, login, sns, signup, signIn, factoryServer] = await Promise.all([
    readFile("lib/authHelpers.ts", "utf8"),
    readFile("app/api/auth/login/route.ts", "utf8"),
    readFile("app/api/auth/sns/session/route.ts", "utf8"),
    readFile("app/api/auth/signup/route.ts", "utf8"),
    readFile("app/sign-in/page.tsx", "utf8"),
    readFile("lib/factoryAuthServer.ts", "utf8"),
  ]);

  assert.doesNotMatch(auth, /for \(const name of \["kakao_user"/);
  assert.doesNotMatch(auth, /JSON\.parse\(factorySession\)/);
  assert.doesNotMatch(login, /loginMethod\s*===\s*["']email_otp/);
  assert.match(sns, /status:\s*410/);
  assert.doesNotMatch(sns, /createSessionRecord/);
  assert.match(signup, /readSignupProof/);
  assert.match(signIn, /\/api\/factory\/login/);
  assert.doesNotMatch(factoryServer, /factoryAuthData|factory\$\{factoryNumber\}!/);
});
