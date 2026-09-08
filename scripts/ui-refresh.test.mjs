import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";
import { getPressArticles } from "../lib/press-news.ts";

test("press articles have unique IDs, valid links and local image assets", async () => {
  const articles = getPressArticles();
  assert.ok(articles.length > 0);
  assert.equal(new Set(articles.map((item) => item.id)).size, articles.length);
  for (const [index, article] of articles.entries()) {
    assert.equal(new URL(article.url).protocol, "https:");
    assert.match(article.date, /^\d{4}-\d{2}-\d{2}$/);
    if (index) assert.ok(articles[index - 1].date >= article.date);
    assert.match(article.image, /^\/images\/news\/[^/]+\.(png|jpg)$/);
    await access(`public${article.image}`);
  }
});

test("home redesign keeps server data, real badges and image error fallback", async () => {
  const source = await readFile("components/InfoSection.tsx", "utf8");
  assert.match(source, /from "@\/lib\/factoryCatalog"/);
  assert.match(source, /f\.factory_type, f\.main_fabrics/);
  assert.match(source, /FactoryImagePlaceholder/);
  assert.match(source, /onError/);
  assert.doesNotMatch(source, /fallbackFactories|Math\.random|Math\.sin|supabaseClient/);
});

test("navigation keeps server-backed auth and composition-safe Korean prompt entry", async () => {
  const header = await readFile("components/Header.tsx", "utf8");
  const hero = await readFile("components/HeroSection.tsx", "utf8");
  assert.match(header, /useAppAuth/);
  assert.doesNotMatch(header, /localStorage|document\.cookie|factoryAuth|kakao_user|naver_user/);
  assert.match(hero, /!event\.nativeEvent\.isComposing/);
  assert.match(hero, /encodeURIComponent\(value\)/);
});

test("new content extends rather than replaces existing search discovery", async () => {
  const sitemap = await readFile("app/sitemap.ts", "utf8");
  const layout = await readFile("app/layout.tsx", "utf8");
  assert.match(sitemap, /factoryRoutes/);
  assert.match(sitemap, /noticeRoutes/);
  assert.match(sitemap, /\/news/);
  assert.match(sitemap, /\/esg/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /openGraph/);
});

test("esg page keeps directional copy without unverified claims", async () => {
  const source = await readFile("app/esg/EsgContent.tsx", "utf8");
  assert.match(source, /복합지원센터/);
  assert.match(source, /지역상생/);
  assert.match(source, /투명한 운영/);
  assert.match(source, /자세히 보기/);
  assert.match(source, /ESG 운영 방침/);
  assert.doesNotMatch(source, /전국 9개|특구|AI 매칭|온실가스 배출량 측정/);
});

test("favicon is a real square ICO with the new blue symbol and matching public fallback", async () => {
  const ico = await readFile("app/favicon.ico");
  assert.deepEqual(ico, await readFile("public/favicon.ico"));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1, "must be ICO, not a renamed PNG");
  const sizes = [96, 48, 32, 16];
  assert.equal(ico.readUInt16LE(4), sizes.length);
  let offset = 6 + 16 * sizes.length;
  for (const [index, size] of sizes.entries()) {
    const entry = 6 + 16 * index;
    assert.equal(ico[entry], size);
    assert.equal(ico[entry + 1], size);
    assert.equal(ico.readUInt32LE(entry + 12), offset);
    const length = ico.readUInt32LE(entry + 8);
    const frame = ico.subarray(offset, offset + length);
    const metadata = await sharp(frame).metadata();
    assert.equal(metadata.format, "png");
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    if (size === 96) {
      const pixels = await sharp(frame).removeAlpha().raw().toBuffer();
      assert.deepEqual([...pixels.subarray(0, 3)], [255, 255, 255]);
      let brandPixels = 0;
      for (let i = 0; i < pixels.length; i += 3) {
        // Resampling the SVG's raster mask produces antialiased color variations.
        if (Math.abs(pixels[i] - 43) <= 8 && Math.abs(pixels[i + 1] - 74) <= 8 && Math.abs(pixels[i + 2] - 120) <= 8) brandPixels++;
      }
      assert.ok(brandPixels > 1000, "must contain the approved #2B4A78 symbol");
    }
    offset += length;
  }
  assert.equal(offset, ico.length);
});
