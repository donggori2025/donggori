import { useEffect, useRef, useState } from "react";

export function useCarouselPlayback() {
  const section = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setPlaying(!motion.matches);
    syncMotion();
    motion.addEventListener("change", syncMotion);

    let inView = false;
    const syncVisibility = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= 0.25;
      syncVisibility();
    }, { threshold: 0.25 });
    if (section.current) observer.observe(section.current);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
      motion.removeEventListener("change", syncMotion);
    };
  }, []);

  return { section, playing, setPlaying, visible };
}
