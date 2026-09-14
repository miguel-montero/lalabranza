"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * A section heading whose words stagger in as it scrolls into view.
 * The heading's accessible name is the plain, unsplit string via
 * aria-label -- screen readers get one clean announcement, never the
 * per-word fragments. The visible, split-into-spans markup used for
 * the animation is aria-hidden and stays fully visible (no opacity:0
 * default) without JavaScript; GSAP only ever animates *from* hidden
 * when prefers-reduced-motion allows it.
 */
export function HeadingReveal({
  text,
  as: Tag = "h2",
  className,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll("[data-word]");

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(spans, {
        opacity: 0,
        y: 14,
        duration: 0.5,
        stagger: 0.06,
        ease: "power1.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    });

    return () => mm.revert();
  }, [text]);

  // Each space is a plain text node sitting between sibling
  // inline-block word boxes, not trapped as the last child inside one
  // -- a space inside an inline-block's own content gets silently
  // trimmed by the browser's whitespace collapsing, which quietly ran
  // every word together the first time this was tried elsewhere in
  // this project (see tagline-reveal.tsx on the other experiment
  // branch).
  const nodes: React.ReactNode[] = [];
  words.forEach((word, i) => {
    nodes.push(
      <span key={"w-" + i} className="inline-block overflow-hidden pb-1 -mb-1">
        <span data-word className="inline-block">
          {word}
        </span>
      </span>,
    );
    if (i < words.length - 1) nodes.push(" ");
  });

  return (
    <Tag className={className}>
      <span aria-label={text}>
        <span ref={ref} aria-hidden="true">
          {nodes}
        </span>
      </span>
    </Tag>
  );
}
