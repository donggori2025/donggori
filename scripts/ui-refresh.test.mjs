import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
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
