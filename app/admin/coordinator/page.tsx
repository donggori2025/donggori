import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Clock3, Inbox, Mail, MessagesSquare, Paperclip, Pin } from "lucide-react";
import { studioStaffRole } from "@/lib/adminSession";
import { inbox, type Inquiry } from "@/lib/studioInquiries";
import { asset, product, sheets } from "@/app/studio/case";
import RefreshInbox from "@/app/studio/coordinator/RefreshInbox";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
});

const showNew = (thread: Inquiry) => !thread.opened;
const awaitingReply = (thread: Inquiry) => thread.messages[thread.messages.length - 1].author === "designer";

export default async function CoordinatorDashboard({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  if (!await studioStaffRole()) redirect("/admin/login");
  const threads = await inbox();
  const { filter } = await searchParams;
  const groups = [
    { key: "all", label: "전체 문의", empty: "아직 접수된 상담 문의가 없습니다.", Icon: Inbox, rows: threads },
    { key: "new", label: "새 문의", empty: "새 문의가 없습니다.", Icon: Mail, rows: threads.filter(showNew) },
    { key: "waiting", label: "답변 대기", empty: "답변을 기다리는 문의가 없습니다.", Icon: Clock3, rows: threads.filter(awaitingReply) },
  ];
  const selection = groups.find(g => g.key === filter) ?? groups[0];
  return <div className="coord-width coord-dashboard">
    <RefreshInbox />
    <h1>{selection.key === "all" ? <>동고리 코디네이터님 <span>환영합니다</span></> : selection.label}</h1>
    <nav className="coord-metrics" aria-label="문의 현황">
      {groups.map(({ key, label, Icon, rows }) =>
        <Link key={key} href={`/admin/coordinator?filter=${key}`}
          scroll={false} aria-current={selection.key === key ? "true" : undefined} aria-label={`${label} ${rows.length}건 보기`}>
          <Icon size={20} aria-hidden /><span>{label}</span><strong>{rows.length}<small>건</small></strong><ArrowUpRight className="coord-metric-arrow" size={17} aria-hidden />
        </Link>)}
    </nav>
    <section aria-labelledby="coord-inbox-title">
      <div className="coord-list-heading"><h2 id="coord-inbox-title">{selection.key === "all" ? "상담 문의" : selection.label} 목록</h2>
        <span>{selection.rows.length}건</span></div>
      {selection.rows.length ? <ul>{selection.rows.map(thread => {
        const first = thread.messages[0];
        const latest = thread.messages[thread.messages.length - 1];
        const pinned = thread.pinned;
        return <li key={thread.id}><Link href={`/admin/coordinator/${thread.id}`} prefetch={false} className="coord-row" data-new={showNew(thread)}>
          {thread.sheet ? <img className="coord-thumb" src={asset("drawing.png")} alt="" />
            : <span className="coord-thumb coord-text-thumb" aria-hidden><MessagesSquare size={24} /></span>}
          <div className="coord-row-copy">
            <span className="coord-attachment">{thread.sheet ? <><Paperclip size={13} />작업지시서 {sheets.length}장</> : "제작 상담"}</span>
            <h3>{thread.sheet ? product : thread.title}{pinned && <Pin className="coord-pin" size={15} aria-label="상단 고정" />}</h3><p>{latest.text}</p>
          </div>
          <div className="coord-row-status">
            {showNew(thread) ? <strong aria-label="새 문의" className="coord-new">NEW</strong> : <span>확인함</span>}
            <time dateTime={new Date(first.at).toISOString()}>{dateFormat.format(first.at)}</time>
          </div>
          <ArrowUpRight className="coord-open" size={20} aria-hidden />
        </Link></li>;
      })}</ul> : <div className="coord-empty"><Inbox size={32} /><p>{selection.empty}</p></div>}
    </section>
  </div>;
}
