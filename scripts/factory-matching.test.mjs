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
