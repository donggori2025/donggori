import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getFactoryImages, getStoredFactoryImages } from "../lib/factoryImages.ts";
import { buildFactoryPatch } from "../lib/factoryAdminFields.ts";
import { writeFactoryImages } from "../lib/factoryImageStorage.ts";
import { getFactoryCertifications } from "../lib/factoryCertifications.ts";
import { validateFactoryPatch } from "../lib/adminHelpers.ts";
import { insertFactoryWithLegacyId } from "../lib/factoryCreation.ts";

test("only the five operator-confirmed factories receive the sewing qualification", () => {
  for (const name of ["꼬메오패션", "호프", "케이스타일", "더시크컴퍼니", "재희패턴"]) {
    assert.deepEqual(getFactoryCertifications(name), ["봉제기능사"]);
  }
  for (const name of ["", "미호패션", "꼬메오", "호프2"]) assert.deepEqual(getFactoryCertifications(name), []);
});

test("full galleries can be reordered without losing photos or accepting unsafe URLs", async () => {
  const original = getFactoryImages({ company_name: "더시크컴퍼니" });
  const remaining = [original[1], original[0], original[2], ...original.slice(6)];
  assert.equal(remaining.length, 25);
  const validated = validateFactoryPatch({ images: remaining, image: remaining[0] });
  assert.equal(validated.ok, true);
  let stored;
  await writeFactoryImages(validated.data, async (row) => {
    if ("images" in row) return { error: { code: "42703", message: 'column "images" does not exist' } };
    stored = row;
    return { error: null };
  });
  assert.deepEqual(getFactoryImages({ company_name: "더시크컴퍼니", ...stored }), remaining);
  assert.equal(validateFactoryPatch({ images: Array(51).fill("https://example.com/a.jpg") }).ok, false);
  assert.equal(validateFactoryPatch({ images: ["javascript:alert(1)"] }).ok, false);
});

test("legacy factory creation retries ID collisions but never unrelated failures", async () => {
  const row = { company_name: "재희패턴", contact_name: "김재희", address: "서울특별시 동대문구 답십리로48길 5, 지층(답십리동)" };
  assert.equal(validateFactoryPatch(row, true).ok, true);
  const attempts = [];
  let id = 328;
  const result = await insertFactoryWithLegacyId(row, async (data) => {
    attempts.push(data);
    if (!("id" in data)) return { error: { code: "23502", message: 'null value in column "id"' } };
    if (data.id === 329) return { error: { code: "23505", message: 'duplicate key violates constraint "donggori_pkey"' } };
    return { error: null };
  }, async () => ++id);
  assert.equal(result.error, null);
  assert.deepEqual(attempts, [row, { ...row, id: 329 }, { ...row, id: 330 }]);
  for (const error of [null, { code: "42501", message: "permission denied" }, { code: "23502", message: 'null value in column "address"' }]) {
    let calls = 0;
    assert.deepEqual(await insertFactoryWithLegacyId(row, async () => { calls++; return { error }; }, async () => { throw Error("must not allocate ID"); }), { error });
    assert.equal(calls, 1);
  }
});

test("legacy image-only tables preserve photo lists without retrying unrelated failures", async () => {
  const photos = ["https://example.com/a.jpg", "https://example.com/b.jpg"];
  const attempts = [];
  const result = await writeFactoryImages({ images: photos, company_name: "테스트공장" }, async (patch) => {
    attempts.push(patch);
    return attempts.length === 1
      ? { error: { code: "PGRST204", message: "Could not find the 'images' column" } }
      : { error: null };
  });
  assert.equal(result.error, null);
  assert.equal(attempts.length, 2);
  assert.deepEqual(attempts[1], { company_name: "테스트공장", image: JSON.stringify(photos) });
  assert.deepEqual(getStoredFactoryImages(attempts[1]), photos);
  assert.deepEqual(getFactoryImages(attempts[1]), photos);
  for (const selected of [[photos[0]], []]) {
    let stored;
    await writeFactoryImages({ images: selected }, async (patch) => {
      if ("images" in patch) return { error: { code: "42703", message: 'column "images" does not exist' } };
      stored = patch;
      return { error: null };
    });
    assert.deepEqual(getStoredFactoryImages(stored), selected);
  }
  let calls = 0;
  const failure = { error: { code: "42501", message: "permission denied for images" } };
  assert.equal(await writeFactoryImages({ images: photos }, async () => { calls++; return failure; }), failure);
  assert.equal(calls, 1);
});

test("photo-only updates omit unchanged legacy fields and preserve coordinate pairs", () => {
  const original = { id: "1", phone_number: 1012345678, company_name: "테스트공장", images: [], lat: 37.5, lng: 127 };
  assert.deepEqual(buildFactoryPatch({ ...original, images: ["https://example.com/photo.jpg"] }, original), {
    images: ["https://example.com/photo.jpg"],
  });
  assert.deepEqual(buildFactoryPatch({ ...original, lat: 37.6 }, original), { lat: 37.6, lng: 127 });
  assert.deepEqual(buildFactoryPatch({ ...original, id: "999", __draft: true }, original), {});
  assert.deepEqual(buildFactoryPatch({ ...original, images: [] }, { ...original, images: ["https://example.com/photo.jpg"] }), { images: [] });
});

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
