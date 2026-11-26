"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function LandingSections({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (!motion.matches) {
          entry.target.animate(
            [{ opacity: 0.6, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 480, easing: "cubic-bezier(.22,.74,.19,1)" },
          );
        }
      }
    });
    root.current.querySelectorAll(":scope > section").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className="pg-page">{children}</div>;
}
