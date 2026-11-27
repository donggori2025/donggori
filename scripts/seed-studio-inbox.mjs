import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { demoPrompt, readDemoRequest } from "../lib/presentationDemo.ts";
import { sampleParkaInquiryId } from "../lib/studioInquiries.ts";

nextEnv.loadEnvConfig(process.cwd(), true);
const root = process.env.STUDIO_INBOX_DIR || path.join(process.cwd(), ".donggori-studio");
const samples = [
  {
    id: sampleParkaInquiryId,
    sheet: "m65-parka-v1",
    request: readDemoRequest(demoPrompt).request,
    minutesAgo: 6,
    question: "무신사 링크로 만든 작업지시서를 첨부했어요. 올리브 18장, 다크올리브 11장, 블랙 18장인데 올리브 M 한 장을 먼저 샘플로 볼 수 있을까요?",
  },
  {
    id: "c246e237-7edc-4ddb-857d-d307aa74417f",
    title: "옥스퍼드 셔츠 60장 · 소매 자수",
    request: "흰색 옥스퍼드 셔츠 60장. 왼쪽 소매에 2cm 로고 자수를 넣고 싶습니다.",
    minutesAgo: 45,
    question: "소매에 자수를 놓은 뒤 봉제하는 게 좋을까요? 자수와 봉제를 함께 맡길 곳을 찾고 있어요.",
  },
  {
    id: "1bb6a96a-3b60-4008-a735-4ec8903d81b1",
    title: "와이드 데님 팬츠 80장 · 워싱 샘플",
    request: "12온스 데님, 중청 한 컬러, S·M·L 합계 80장. 세탁 후에도 기장이 유지되어야 합니다.",
    minutesAgo: 190,
    question: "워싱을 하고 나면 기장이 얼마나 줄어드는지 궁금해요. 본생산 전에 한 장으로 확인할 수 있을까요?",
    reply: "샘플 한 장의 워싱 전후 치수를 비교해 보겠습니다. 완성 기장과 사용하실 원단 정보를 보내주세요.",
  },
  {
    id: "8c58979d-c775-4df7-a4de-d5976bd7dfbb",
    title: "린넨 랩 원피스 40장 · 원단 소요량",
    request: "린넨·레이온 혼방, 두 컬러 각 20장. 허리에는 같은 원단으로 만든 긴 끈을 사용합니다.",
    minutesAgo: 1400,
    question: "폭 140cm 원단을 주문하려고 해요. 랩 원피스 허리끈까지 포함해서 소요량을 계산해 주실 수 있나요?",
    reply: "원단 폭은 확인했어요. 총장과 허리끈 길이를 알려주시면 사이즈별 소요량을 살펴보겠습니다.",
  },
];

await mkdir(root, { recursive: true, mode: 0o700 });
const now = Date.now();
for (const sample of samples) {
  const stage = await mkdtemp(path.join(root, ".seed-"));
  try {
    const meta = { owner: null, sheet: sample.sheet ?? null, title: sample.title, request: sample.request };
    await writeFile(path.join(stage, "thread.json"), JSON.stringify(meta), { mode: 0o600 });
    const at = now - sample.minutesAgo * 60_000;
    const messages = [{ author: "designer", text: sample.question, at }];
    if (sample.reply) {
      messages.push({ author: "coordinator", text: sample.reply, at: at + 12 * 60_000 });
      await writeFile(path.join(stage, "opened"), "", { mode: 0o600 });
    }
    for (const message of messages) {
      const id = randomUUID().replaceAll("-", "");
      await writeFile(path.join(stage, `msg-${message.author}-${id}`), JSON.stringify({ id, ...message }), { mode: 0o600 });
    }
    // Publish once. Running this again preserves read state and replies from rehearsals.
    await rename(stage, path.join(root, sample.id));
  } catch (error) {
    if (error.code !== "EEXIST" && error.code !== "ENOTEMPTY") throw error;
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}
