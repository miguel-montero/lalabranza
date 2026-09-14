"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * A single authored line, its words lighting up from a muted tone to
 * full contrast one at a time as the reader scrolls through it — the
 * one place on the page where scroll position itself drives the
 * animation (scrubbed), rather than a one-time triggered reveal. The
 * full sentence is always present as ordinary text (each word is its
 * own <span>, never removed from the accessible name or reading
 * order) — only its color opacity is what's animated, and only when
 * motion is allowed. Under reduced motion, every word simply renders
 * at full contrast from the start.
 */
export function TaglineReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll("[data-word]");

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(spans, { opacity: 0.3 });
      gsap.to(spans, {
        opacity: 1,
        stagger: 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          end: "bottom 40%",
          scrub: 0.3,
        },
      });
    });

    return () => mm.revert();
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        // The space between words is a plain sibling text node, not part
        // of the span's own content — a trailing space *inside* an
        // inline-block box gets silently trimmed by the browser's
        // whitespace collapsing, which quietly ran every word together.
        <span key={i}>
          <span data-word className="inline-block">
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
