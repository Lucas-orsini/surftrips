"use client";

import { LazyMotion, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { loadMotionFeatures } from "@/lib/load-motion";

export function Reveal({
  children,
  className = "",
  delay = 0,
  image = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  image?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <LazyMotion features={loadMotionFeatures}>
      <m.div
        className={className}
        initial={false}
        whileInView={
          reduced
            ? {}
            : {
                opacity: [0.65, 1],
                y: [18, 0],
                ...(image
                  ? { clipPath: ["inset(0 0 6% 0)", "inset(0 0 0% 0)"] }
                  : {}),
              }
        }
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
