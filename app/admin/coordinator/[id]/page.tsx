import { notFound, redirect } from "next/navigation";
import { studioStaffRole } from "@/lib/adminSession";
import { getInquiry } from "@/lib/studioInquiries";
import CoordinatorRoom from "@/app/studio/coordinator/CoordinatorRoom";

export default async function StaffConsultation({ params }: { params: Promise<{ id: string }> }) {
  if (!await studioStaffRole()) redirect("/admin/login");
  const { id } = await params;
  const thread = await getInquiry(id);
  if (!thread?.messages.length) notFound();
  return <CoordinatorRoom key={id} id={id} author="coordinator" topic={thread.sheet ? undefined : thread.title}
    request={thread.request} messages={thread.messages} opened={thread.opened} />;
}
