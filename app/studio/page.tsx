import type { Metadata } from "next";
import FactoryPrompt from "@/components/FactoryPrompt";
import { parkaOrder, readDemoRequest } from "@/lib/presentationDemo";
import { getPublicFactoryList } from "@/lib/publicFactoryList";
import { requestPartners, samplePartners } from "./requestPartners";
import Presentation from "./Presentation";
import "../home.css";
import "./presentation.css";

export const metadata: Metadata = {
  title: "제작 의뢰와 상담 | 동고리",
  robots: { index: false, follow: false },
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string | string[]; draft?: string | string[]; view?: string; consultation?: string }>;
}) {
  const { prompt, draft, view, consultation } = await searchParams;
  const request = typeof prompt === "string" ? prompt.trim() : "";
  const input = readDemoRequest(request);
  if (input?.sample) {
    const order = parkaOrder(input.request);
    const factories = await getPublicFactoryList().catch(() => null);
    const matches = order.sample ? samplePartners(factories ?? []) : factories && requestPartners(factories, order.text, "사파리/헌팅 재킷");
    return <Presentation key={JSON.stringify([request, view])} startAtMatches={view === "matches"} completed={view === "sheet"} inquiryId={consultation}
      request={input.request} source={input.source} matches={matches} />;
  }
  if (request && !input) {
    const factories = await getPublicFactoryList().catch(() => null);
    return <Presentation key={request} request={request} matches={factories && requestPartners(factories, request)} />;
  }
  const initial = typeof draft === "string" ? draft : request;
  return (
    <div className="pg-page studio-entry">
      <section className="pg-search" aria-labelledby="studio-prompt-title">
        <h1 id="studio-prompt-title">새 제작 의뢰</h1>
        <div className="pg-prompt-stage">
          <FactoryPrompt key={initial} inputId="studio-prompt" initialPrompt={initial} autoFocus showRequestExamples />
        </div>
      </section>
    </div>
  );
}
