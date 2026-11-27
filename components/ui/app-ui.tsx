import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

export function PageShell({ children, readable = false, className }: {
  children: ReactNode;
  readable?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("publication-shell min-h-[70vh] py-8 sm:py-12", className)}>
      <div className={`${PAGE_CONTAINER_CLASS} publication-layout`}>
        <nav aria-label="동고리 이용 안내" className="publication-index">
          <h2>동고리 안내</h2>
          {[
            ["/service", "서비스 이용안내"], ["/work-order", "작업지시서"], ["/faq", "자주 묻는 질문"],
            ["/news?type=press", "보도자료"], ["/notices", "공지사항"], ["/esg", "ESG"],
          ].map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className={readable ? "publication-body max-w-3xl" : "publication-body"}>{children}</div>
      </div>
    </section>
  );
}

export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <header className="dg-service-heading mb-8">
      <h1 className="dg-page-title">{title}</h1>
      {description && <div className="mt-4 max-w-2xl text-sm leading-7 text-dg-muted sm:text-base">{description}</div>}
    </header>
  );
}
