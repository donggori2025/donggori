"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { studioStaffRole } from "@/lib/adminSession";
import { appendMessage, createInquiry, getInquiry, markInquiryOpened, ownsInquiry, type Speaker } from "@/lib/studioInquiries";

import { getFactoryImages } from "@/lib/factoryImages";
import { getPublicFactoryList } from "@/lib/publicFactoryList";
import { productionItems, type Factory } from "@/lib/factoryCatalog";
import { requestPartners } from "../requestPartners";
import type { FactoryCard } from "@/lib/studioInquiries";

function cardInfo(f: Factory) {
  return { id: f.id, photo: getFactoryImages(f).find(url => !url.includes("logo_donggori")), name: f.company_name || f.name, district: f.admin_district || f.region,
    item: f.factory_type || "제작업체" };
}

export async function findInquiryFactories(id: string, extra: string, query: string) {
  if (!await studioStaffRole()) throw new Error("로그인이 필요합니다.");
  const thread = await getInquiry(id);
  if (!thread?.messages.length) throw new Error("문의를 확인해 주세요.");
  const factories = await getPublicFactoryList();
  if (!query.trim()) {
    return requestPartners(factories, [thread.request, extra.slice(0, 300)].join(" "), thread.sheet ? "사파리/헌팅 재킷" : undefined, extra.slice(0, 300))
      .map(({ id, name, district, item, reason, photos }) => ({ id, name, district, item, reason, photo: photos.find(url => !url.includes("logo_donggori")) }));
  }
  const words = query.trim().toLowerCase().slice(0, 100).split(/\s+/);
  return factories.flatMap(f => {
    const info = cardInfo(f);
    const items = productionItems(f);
    const haystack = [info.name, info.district, info.item, ...items, f.main_fabrics].join(" ").toLowerCase().replace(/\s/g, "");
    if (!words.every(word => haystack.includes(word))) return [];
    const item = items.find(i => words.some(w => i.includes(w))) || items[0] || info.item;
    return [{ ...info, item, reason: [info.district, item].filter(Boolean).join(" · ") + " 분야에 등록된 업체입니다." }];
  }).slice(0, 40);
}

const ownerCookie = "studio_designer";

export async function beginConsultation(form: FormData) {
  const jar = await cookies();
  let token = jar.get(ownerCookie)?.value;
  const request = String(form.get("request") ?? "").slice(0, 4000);
  const withSheet = form.get("withSheet") !== "false";
  const lastId = form.get("inquiryId");
  if (token && typeof lastId === "string") {
    const last = await getInquiry(lastId);
    if (last && last.request === request && Boolean(last.sheet) === withSheet && ownsInquiry(last, token)) redirect(`/studio/coordinator/${last.id}`);
  }
  if (!token) {
    token = randomUUID();
    jar.set(ownerCookie, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  }
  const id = await createInquiry(token, request, withSheet);
  redirect(`/studio/coordinator/${id}`);
}

export async function sendStudioMessage(id: string, author: Speaker, key: string, text: string, selected: Pick<FactoryCard, "id" | "reason">[] = []) {
  if (author !== "designer" && author !== "coordinator") return false;
  const thread = await getInquiry(id);
  if (!thread) return false;
  const allowed = author === "coordinator"
    ? thread.messages.length > 0 && await studioStaffRole()
    : ownsInquiry(thread, (await cookies()).get(ownerCookie)?.value);
  if (!allowed || typeof text !== "string" || text.length > 2000 || !Array.isArray(selected) || selected.length > 3) return false;
  if (!text.trim() && !selected.length) return false;
  const cards: FactoryCard[] = [];
  if (selected.length) {
    if (author !== "coordinator") return false;
    const factories = await getPublicFactoryList();
    for (const entry of selected) {
      const factory = factories.find(f => f.id === entry?.id);
      if (!factory || typeof entry.reason !== "string" || !entry.reason.trim() || entry.reason.length > 300 || cards.some(c => c.id === entry.id)) return false;
      cards.push({ ...cardInfo(factory), reason: entry.reason.trim() });
    }
  }
  await appendMessage(id, key, author, text.trim() || "이번 의뢰에 추천드리는 업체입니다.", cards);
  return true;
}

export async function openStaffInquiry(id: string) {
  if (!await studioStaffRole()) return;
  const thread = await getInquiry(id);
  if (thread?.messages.length && !thread.opened) await markInquiryOpened(id);
}
