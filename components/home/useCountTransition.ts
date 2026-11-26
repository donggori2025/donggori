"use client";

import { useEffect, useRef, useState } from "react";

export function useCountTransition<T extends HTMLElement>(targets: readonly number[]) {
  const ref = useRef<T>(null);
  const entered = useRef(false);
  const current = useRef<readonly number[]>(targets);
  const [values, setValues] = useState(targets);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let observer: IntersectionObserver | undefined;

    function show(numbers: readonly number[]) {
      current.current = numbers;
      setValues(numbers);
    }
    function finish() {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      entered.current = true;
      show(targets);
    }
    function animate() {
      observer?.disconnect();
      const duration = entered.current ? 520 : 1200;
      entered.current = true;
      const from = current.current;
      if (targets.every((end, i) => end === from[i])) return;
      const start = performance.now();
      function tick(now: number) {
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        if (t === 1) {
          show(targets);
          return;
        }
        const eased = 1 - (1 - t) ** 2;
        show(targets.map((end, i) => Math.round(from[i] + (end - from[i]) * eased)));
        frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }

    if (motion.matches || !("IntersectionObserver" in window)) {
      finish();
      return;
    }
    if (entered.current) {
      animate();
    } else {
      show(targets.map(() => 0));
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= .25) animate();
      }, { threshold: .25 });
      observer.observe(element);
    }
    function onMotionChange() {
      if (motion.matches) finish();
    }
    motion.addEventListener("change", onMotionChange);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [targets]);

  return { ref, values };
}
