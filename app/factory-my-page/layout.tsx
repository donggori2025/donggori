import type { ReactNode } from "react";
import FactoryShell from "@/components/factory/FactoryShell";

export default function FactoryMyPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <FactoryShell />
      {children}
    </div>
  );
}
