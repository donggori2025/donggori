import type { ReactNode } from "react";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-[#f5f5f3] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </section>
  );
}
