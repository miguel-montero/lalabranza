"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Like Reveal, but for photos specifically: settles in from a slight
 * zoom (scale 1.06 -> 1) alongside the fade, echoing a lens finding
 * focus rather than just appearing. Same reduced-motion gating — the
 * image renders at its resting scale/opacity by default, and GSAP only
 * ever animates *from* the zoomed/hidden state when motion is allowed.
 */
export function RevealImage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(el, {
        opacity: 0,
        scale: 1.06,
        duration: 0.6,
        ease: "power1.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
