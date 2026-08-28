import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { canAccessMatchRequest } from "../lib/matchRequestAuth.ts";
import { createOAuthState, safeNextPath, verifyOAuthState } from "../lib/oauthState.ts";

test("match request access is limited to the owner or admin", () => {
  const row = { user_id: "user-1", user_email: "a@example.com", factory_id: "factory-1" };
  assert.equal(canAccessMatchRequest({ authenticated: true, role: "user", userId: "user-1" }, row), true);
  assert.equal(canAccessMatchRequest({ authenticated: true, role: "user", userId: "user-2" }, row), false);
  assert.equal(canAccessMatchRequest({ authenticated: true, role: "admin" }, row), true);
});

test("post-login redirects stay inside this site", () => {
  assert.equal(safeNextPath("/factories/1/request"), "/factories/1/request");
  assert.equal(safeNextPath("//evil.example"), "/");
  assert.equal(safeNextPath("/\\evil.example"), "/");
  assert.equal(safeNextPath("https://evil.example"), "/");
});

test("OAuth state must match the server cookie", () => {
  const state = createOAuthState();
  assert.equal(verifyOAuthState(state, state), true);
  assert.equal(verifyOAuthState(`${state}x`, state), false);
  assert.equal(verifyOAuthState(null, state), false);
});

test("critical auth bypasses stay removed", async () => {
  const [auth, context, login, sns, signup, signupPage, signupContext, kakaoCallback, naverCallback, signIn, changePassword, resetPassword, emailOtp, session, myPage, factoryDetail, factoryPrivacy, factoryPopup, matchRequests, utils, socialIdentityMigration, lockdown] = await Promise.all([
    readFile("lib/authHelpers.ts", "utf8"),
    readFile("contexts/AuthContext.tsx", "utf8"),
    readFile("app/api/auth/login/route.ts", "utf8"),
    readFile("app/api/auth/sns/session/route.ts", "utf8"),
    readFile("app/api/auth/signup/route.ts", "utf8"),
    readFile("app/sign-up/page.tsx", "utf8"),
    readFile("app/api/auth/signup-context/route.ts", "utf8"),
    readFile("app/api/auth/kakao/callback/route.ts", "utf8"),
    readFile("app/api/auth/naver/callback/route.ts", "utf8"),
    readFile("app/sign-in/page.tsx", "utf8"),
    readFile("app/api/auth/change-password/route.ts", "utf8"),
    readFile("app/api/auth/reset-password/route.ts", "utf8"),
    readFile("lib/emailOtp.ts", "utf8"),
    readFile("lib/session.ts", "utf8"),
    readFile("app/my-page/page.tsx", "utf8"),
    readFile("app/factories/[id]/page.tsx", "utf8"),
    readFile("lib/factoryPrivacy.ts", "utf8"),
    readFile("components/FactoryInfoPopup.tsx", "utf8"),
    readFile("app/api/match-requests/route.ts", "utf8"),
    readFile("lib/utils.ts", "utf8"),
    readFile("supabase/migrations/20260828_social_identity_unique.sql", "utf8"),
    readFile("supabase/migrations/20260828_lock_down_app_tables.sql", "utf8"),
  ]);

  assert.doesNotMatch(auth, /factory_session/);
  assert.match(context, /fetch\("\/api\/auth\/me"/);
  assert.doesNotMatch(context, /kakao_user|localStorage/);
  assert.doesNotMatch(login, /loginMethod\s*===\s*["']email_otp/);
  assert.match(sns, /status:\s*410/);
  assert.doesNotMatch(sns, /createSessionRecord/);
  assert.match(signup, /readSignupProof/);
  assert.match(signupContext, /readSignupProof/);
  assert.doesNotMatch(signupPage, /document\.cookie|temp_kakao_user|temp_naver_user/);
  assert.doesNotMatch(kakaoCallback, /httpOnly:\s*false|temp_kakao_user/);
  assert.doesNotMatch(naverCallback, /httpOnly:\s*false|temp_naver_user/);
  assert.doesNotMatch(signIn, /\/api\/factory\/login|localStorage|isLoggedIn=true/);
  assert.match(changePassword, /String\(newPassword\)\.length < 10/);
  assert.match(resetPassword, /String\(newPassword\)\.length < 10/);
  assert.match(changePassword, /revokeUserSessions\(user\.id\)/);
  assert.match(resetPassword, /revokeUserSessions\(user\.id\)/);
  assert.match(emailOtp, /인증 보안 설정이 준비되지 않았습니다/);
  assert.doesNotMatch(emailOtp, /attemptError && !/);
  assert.match(emailOtp, /consumeError \|\| !consumed/);
  assert.match(session, /createHash\("sha256"\)\.update\(token\)/);
  assert.doesNotMatch(session, /process\.env\.ADMIN_SESSION_SECRET/);
  assert.doesNotMatch(myPage, /localStorage|document\.cookie|kakaoMessageConsent|프로필 이미지 삭제/);
  assert.match(factoryDetail, /useAppAuth/);
  assert.match(factoryDetail, /fetch\("\/api\/match-requests"/);
  assert.doesNotMatch(factoryDetail, /localStorage|document\.cookie|factory_user|kakao_user|naver_user/);
  assert.match(factoryPrivacy, /Math\.round\(coordinate \* 100\) \/ 100/);
  assert.doesNotMatch(factoryPopup, /Math\.sin|const seed|const hash/);
  assert.match(matchRequests, /\.from\("users"\)/);
  assert.match(matchRequests, /body\.user_id = account\.id/);
  assert.doesNotMatch(utils, /localStorage|document\.cookie|isAppLoggedIn/);
  assert.match(socialIdentityMigration, /unique index if not exists idx_users_social_identity_unique/);
  assert.match(lockdown, /revoke all privileges on table public\.%I from anon, authenticated/);
});
