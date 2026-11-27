import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getInquiry, ownsInquiry } from "@/lib/studioInquiries";
import CoordinatorRoom from "../CoordinatorRoom";
import "../../presentation.css";

export const metadata = { title: "코디네이터와 상담 | 동고리", robots: { index: false, follow: false } };

export default async function DesignerConsultation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await getInquiry(id);
  if (!thread || !ownsInquiry(thread, (await cookies()).get("studio_designer")?.value)) notFound();
  return <CoordinatorRoom key={id} id={id} author="designer" topic={thread.sheet ? undefined : thread.title}
    request={thread.request} messages={thread.messages} opened={thread.opened} />;
}
