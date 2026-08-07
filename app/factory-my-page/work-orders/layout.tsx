import type { ReactNode } from "react";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

export default function FactoryWorkOrdersLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${PAGE_CONTAINER_CLASS} max-w-[1200px] py-4 md:py-5`}>{children}</div>
  );
}
