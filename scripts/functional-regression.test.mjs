import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getFactoryImages } from "../lib/factoryImages.ts";

test("factory images prefer DB values and restore complete legacy galleries", () => {
  assert.deepEqual(getFactoryImages({ company_name: "신규공장", images: ["https://example.com/a.jpg"] }), ["https://example.com/a.jpg"]);
  const gallery = getFactoryImages({ company_name: "강훈무역", images: [] });
  assert.equal(gallery.length, 11);
  assert.equal(gallery[0], "https://m7fjtbfe2aen7kcw.public.blob.vercel-storage.com/%EA%B0%95%ED%9B%88%EB%AC%B4%EC%97%AD/20250710_103857.jpg");
  assert.equal(new Set(gallery).size, gallery.length);
  assert.equal(getFactoryImages({ name: "다온패션" }).length, 5);
  assert.equal(getFactoryImages({ name: "우진모피" }).length, 46);
  assert.equal(getFactoryImages({ name: "제훈사 (구 아이템)" }).length, 4);
  assert.equal(getFactoryImages({ name: "실루엣컴퍼니" }).length, 11);
  assert.equal(getFactoryImages({ name: "라인스" }).length, 9);
  assert.equal(getFactoryImages({ name: "박원니트", image: "/api/factory-images/url?folder=%EB%B0%95%EC%9B%90%EB%8B%88%ED%8A%B8&file=20250711_102529.jpg" }).length, 20);
  const legacyCover = gallery[1];
  const restored = getFactoryImages({ name: "강훈무역", images: [legacyCover] });
  assert.equal(restored.length, 11);
  assert.equal(restored[0], legacyCover);
  assert.deepEqual(getFactoryImages({ name: "희망사" }), []);
  assert.deepEqual(getFactoryImages({ company_name: "강훈무역", images: '["https://example.com/new.jpg"]', image: "https://example.com/new.jpg" }), ["https://example.com/new.jpg"]);
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
