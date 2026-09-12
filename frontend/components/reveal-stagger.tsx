"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Like Reveal, but staggers each direct child in slightly after the last
 * as the group scrolls into view — for the highlights strip and gallery
 * grid, where the items are a set rather than a single block. Children
 * are targeted by a stable data attribute (not array index), since index
 * targeting breaks under React re-renders per the project's GSAP
 * guidance. Same reduced-motion gating as Reveal.
 */
export function RevealStagger({
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
      const items = el.querySelectorAll("[data-reveal-item]");
      gsap.from(items, {
        opacity: 0,
        y: 12,
        duration: 0.3,
        stagger: 0.08,
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
