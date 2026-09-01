import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getFactoryImages } from "../lib/factoryImages.ts";

test("factory images prefer DB values and preserve verified legacy thumbnails", () => {
  assert.deepEqual(getFactoryImages({ company_name: "신규공장", images: ["https://example.com/a.jpg"] }), ["https://example.com/a.jpg"]);
  assert.deepEqual(getFactoryImages({ company_name: "강훈무역", images: [] }), [
    "https://m7fjtbfe2aen7kcw.public.blob.vercel-storage.com/%EA%B0%95%ED%9B%88%EB%AC%B4%EC%97%AD/20250710_103857.jpg",
  ]);
  assert.deepEqual(getFactoryImages({ company_name: "이미지없는공장", images: [] }), []);
});

test("email authentication entry points stay disabled while social-only mode is active", async () => {
  const [login, requestOtp, verifyOtp, signup] = await Promise.all([
    readFile("app/api/auth/login/route.ts", "utf8"),
    readFile("app/api/auth/email/request/route.ts", "utf8"),
    readFile("app/api/auth/email/verify/route.ts", "utf8"),
    readFile("app/api/auth/signup/route.ts", "utf8"),
  ]);
  assert.match(login, /status:\s*410/);
  assert.match(requestOtp, /status:\s*410/);
  assert.match(verifyOtp, /status:\s*410/);
  assert.match(signup, /signupMethod === "email"/);
});
