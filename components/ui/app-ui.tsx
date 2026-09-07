import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PAGE_CONTAINER_CLASS, READABLE_CONTAINER_CLASS } from "@/lib/layout";

export function PageShell({ children, readable = false, className }: {
  children: ReactNode;
  readable?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("min-h-[70vh] bg-white py-14 sm:py-20 lg:py-24", className)}>
      <div className={readable ? READABLE_CONTAINER_CLASS : PAGE_CONTAINER_CLASS}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <header className="mb-10 max-w-3xl sm:mb-14">
      <h1 className="dg-page-title">{title}</h1>
      {description && <div className="mt-4 max-w-2xl text-sm leading-7 text-dg-muted sm:text-base">{description}</div>}
    </header>
  );
}
