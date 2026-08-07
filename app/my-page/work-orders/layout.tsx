import type { ReactNode } from "react";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

export default function WorkOrdersLayout({ children }: { children: ReactNode }) {
  return <div className={`${PAGE_CONTAINER_CLASS} py-4 sm:py-6`}>{children}</div>;
}
