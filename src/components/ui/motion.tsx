"use client";

// Re-exported behind "use client" so Server Components (app/page.tsx) can
// keep importing the landing sections without each one needing its own
// directive just to reach framer-motion.
export { motion, AnimatePresence } from "framer-motion";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

/** Counts up from 0 to `value` once it scrolls into view. */
export function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, duration]);

  return <span ref={ref}>{display}</span>;
}
