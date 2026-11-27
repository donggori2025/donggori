"use client";

import { useFormStatus } from "react-dom";
import { MessagesSquare } from "lucide-react";
import { beginConsultation } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="studio-coordinator-button" disabled={pending}>
    <MessagesSquare size={18} />{pending ? "상담창 여는 중…" : "코디네이터와 상담하기"}
  </button>;
}

export default function CoordinatorButton({ request, inquiryId, withSheet = true }: { request: string; inquiryId?: string; withSheet?: boolean }) {
  return <form className="studio-coordinator-action" action={beginConsultation}>
    {inquiryId && <input type="hidden" name="inquiryId" value={inquiryId} />}
    <input type="hidden" name="withSheet" value={String(withSheet)} />
    <input type="hidden" name="request" value={request} /><Submit />
  </form>;
}
