import assert from "node:assert/strict";
import test from "node:test";
import { recommendFactoriesFromPrompt, scoreFactoryForPrompt, takeMeaningfulMatches } from "../lib/factoryMatching.ts";

const factory = (name, details = {}) => ({
  id: name,
  name,
  company_name: name,
  region: "서울",
  items: [],
  minOrder: 100,
  description: "",
  image: "",
  contact: "",
  lat: 0,
  lng: 0,
  kakaoUrl: "",
  processes: [],
  ...details,
});

test("a factory name no longer receives a hard-coded 100 point boost", () => {
  const result = scoreFactoryForPrompt(factory("박원니트"), "니트 소량 생산");
  assert.ok(result.score > 0 && result.score < 100);
});

test("no text match produces no random factory result", () => {
  const results = recommendFactoriesFromPrompt([factory("A"), factory("B")], "전혀없는조건", 3);
  assert.deepEqual(results, []);
});

test("wizard results never fill empty slots with low-score factories", () => {
  const results = takeMeaningfulMatches([
    { id: "strong", score: 65 },
    { id: "weak", score: 29 },
    { id: "none", score: 0 },
  ]);
  assert.deepEqual(results, [{ id: "strong", score: 65 }]);
});


test("production totals distinguish color allocations from alternatives and production stages", async () => {
  const { requestQuantity } = await import("../lib/presentationDemo.ts");
  assert.equal(requestQuantity("블랙 30장, 네이비 20장"), 50);
  assert.equal(requestQuantity("블랙 30장 또는 네이비 20장"), null);
  assert.equal(requestQuantity("샘플 1장, 본생산 100장"), null);
  assert.equal(requestQuantity("총 50장 (블랙 30장, 네이비 20장)"), 50);
});
