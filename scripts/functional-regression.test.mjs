import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { getFactoryImages, getStoredFactoryImages } from "../lib/factoryImages.ts";
import { buildFactoryPatch } from "../lib/factoryAdminFields.ts";
import { writeFactoryImages } from "../lib/factoryImageStorage.ts";
import { getDistrictPinPosition, groupDistrictFactories } from "../lib/dongdaemunMap.ts";
import { directoryHref, readDirectoryQuery, filterDirectoryFactories } from "../lib/factoryDirectoryFilters.ts";
import { toMapFactory } from "../lib/factoryMapRows.ts";
import { readPreviewFactoryList } from "../lib/publicFactoryPreview.ts";
import { appendMessage, createInquiry, getInquiry, inbox, markInquiryOpened, ownsInquiry } from "../lib/studioInquiries.ts";

test("an inquiry enters the inbox on send; retries and concurrent replies preserve its conversation", async t => {
  const previous = process.env.STUDIO_INBOX_DIR;
  const dir = await mkdtemp(path.join(tmpdir(), "donggori-inbox-"));
  process.env.STUDIO_INBOX_DIR = dir;
  t.after(async () => {
    if (previous === undefined) delete process.env.STUDIO_INBOX_DIR;
    else process.env.STUDIO_INBOX_DIR = previous;
    await rm(dir, { recursive: true, force: true });
  });
  const owner = randomUUID();
  const id = await createInquiry(owner, "숏 파카 제작");
  const draft = await getInquiry(id);
  assert(ownsInquiry(draft, owner));
  assert(!ownsInquiry(draft, randomUUID()));
  assert.deepEqual(await inbox(), []);
  const key = randomUUID().replaceAll("-", "");
  await Promise.all([1, 2].map(() => appendMessage(id, key, "designer", "샘플 제작 문의")));
  const [received] = await inbox();
  assert.equal(received.messages.length, 1);
  assert.equal(received.opened, false);
  await Promise.all([
    markInquiryOpened(id),
    appendMessage(id, randomUUID().replaceAll("-", ""), "coordinator", "샘플 가능해요."),
    appendMessage(id, randomUUID().replaceAll("-", ""), "designer", "일정도 궁금해요."),
  ]);
  const [updated] = await inbox();
  assert.equal(updated.opened, true);
  assert.equal(updated.messages.length, 3);
});

test("preview shares cold reads, serves recent data during refresh, and retries expired failures", async t => {
  let now = 0;
  t.mock.method(Date, "now", () => now);
  let respond;
  const upstream = t.mock.method(globalThis, "fetch", () => new Promise(resolve => { respond = resolve; }));
  const list = id => Response.json({ success: true, data: [{ id }] });

  const first = readPreviewFactoryList();
  const concurrent = readPreviewFactoryList();
  assert.strictEqual(concurrent, first);
  respond(list("a"));
  assert.deepEqual(await first, [{ id: "a" }]);
  assert.deepEqual(await readPreviewFactoryList(), [{ id: "a" }]);
  assert.equal(upstream.mock.callCount(), 1);

  now = 61_000;
  assert.deepEqual(await readPreviewFactoryList(), [{ id: "a" }]);
  assert.deepEqual(await readPreviewFactoryList(), [{ id: "a" }]);
  assert.equal(upstream.mock.callCount(), 2);
  respond(list("b"));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(await readPreviewFactoryList(), [{ id: "b" }]);

  now += 301_000;
  const expired = readPreviewFactoryList();
  respond(new Response(null, { status: 503 }));
  await assert.rejects(expired);
  const retry = readPreviewFactoryList();
  respond(list("c"));
  assert.deepEqual(await retry, [{ id: "c" }]);
});

test("directory filters round-trip between views and district groups never invent a public position", () => {
  const rows = [
    { id: "a", name: "테스트", admin_district: "답십리 제2동", top_items_upper: "셔츠|재킷", lat: 0, lng: 0 },
    { id: "b", name: "테스트", admin_district: "면목동", top_items_upper: "재킷", lat: 37.56, lng: 127.06 },
    { id: "c", name: "기타", admin_district: "", lat: 37.59, lng: 127.05 },
  ];
  const { selected, search } = readDirectoryQuery(new URLSearchParams("items=재킷&district=답십리+제2동&district=면목동&q=테스트"));
  assert.deepEqual(filterDirectoryFactories(rows, selected, search).map(row => row.id), ["a", "b"]);
  for (const path of ["/factories", "/factories/list"]) {
    const url = new URL(directoryHref(path, selected, search), "https://example.com");
    assert.deepEqual(readDirectoryQuery(url.searchParams), { selected, search });
  }
  assert.deepEqual(groupDistrictFactories(rows, "district").map(pin => [pin.label, pin.factories[0].id]), [["답십리동", "a"]]);
  const [district] = groupDistrictFactories(rows, "district");
  assert.ok(getDistrictPinPosition(district.lng, district.lat));
  assert.deepEqual(groupDistrictFactories(rows, "position").map(pin => [pin.factories[0].id, pin.lng, pin.lat]), [["c", 127.05, 37.59]]);
});

test("initial map data keeps filters and public pins without exposing galleries or contacts", () => {
  const raw = {
    id: "1", name: "테스트", admin_district: "용두동", region: "용두동",
    lat: 37.58029, lng: 127.04024, image: "/cover.jpg", images: ["/cover.jpg", "/other.jpg"],
    phone_number: "private", address: "private", moq: 0, main_fabrics: "면",
    top_items_upper: "카라 티셔츠", intro: "소량 제작",
  };
  const row = toMapFactory(raw);
  assert.deepEqual([row.lat, row.lng, row.image], [37.58, 127.04, "/cover.jpg"]);
  for (const key of ["images", "phone_number", "address"]) assert.ok(!(key in row));
  const { selected, search } = readDirectoryQuery(new URLSearchParams("moq=0-50&main_fabrics=면&q=소량"));
  assert.equal(filterDirectoryFactories([row], selected, search).length, 1);
  assert.equal(groupDistrictFactories([row], "position")[0].factories[0].id, raw.id);
  assert.equal(toMapFactory({ ...raw, image: "/logo_donggori.png" }).image, undefined);
});

test("the landing map excludes public pin locations outside the district outline", () => {
  for (const [lng, lat] of [[127.02, 37.57], [127.04, 37.57], [127.06, 37.56], [0, 0], [NaN, 37.59]]) {
    assert.equal(getDistrictPinPosition(lng, lat), null);
  }
  // The rounded public point in Sinseol-dong is just inside the southern boundary.
  for (const [lng, lat] of [[127.03, 37.57], [127.07, 37.6], [127.05, 37.59]]) {
    const pin = getDistrictPinPosition(lng, lat);
    assert.ok(pin && pin.x > 0 && pin.x < 100 && pin.y > 0 && pin.y < 100);
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
