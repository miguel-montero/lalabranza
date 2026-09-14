"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Eyebrow } from "./eyebrow";

/**
 * The hero's one deliberate load-in moment: eyebrow, headline (word by
 * word), and subhead stagger in on mount -- not scroll-triggered, this
 * is above the fold and already visible at rest. Gated behind
 * prefers-reduced-motion the same way Reveal/RevealStagger are; each
 * line renders at full opacity by default and GSAP only ever animates
 * *from* hidden when motion is actually allowed, so there's no flash
 * of invisible content if JS is slow, disabled, or motion is reduced.
 *
 * The headline's accessible name stays the plain, unsplit string (via
 * aria-label on the wrapping span) -- the per-word markup used for the
 * animation is aria-hidden, so screen readers get one clean
 * announcement rather than word fragments.
 */
export function HeroIntro({
  eyebrow,
  headline,
  subhead,
  className,
}: {
  eyebrow: string;
  headline: string;
  subhead: string;
  className?: string;
}) {
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineWordsRef = useRef<HTMLSpanElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);

  const headlineNodes: React.ReactNode[] = [];
  headline.split(" ").forEach((word, i, arr) => {
    headlineNodes.push(
      <span key={"hw-" + i} className="inline-block overflow-hidden pb-1 -mb-1">
        <span data-headline-word className="inline-block">
          {word}
        </span>
      </span>,
    );
    if (i < arr.length - 1) headlineNodes.push(" ");
  });

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = headlineWordsRef.current?.querySelectorAll("[data-headline-word]");
      gsap
        .timeline()
        .from(eyebrowRef.current, { opacity: 0, y: 10, duration: 0.4, ease: "power1.out" })
        .from(
          words ?? [],
          { opacity: 0, y: 18, duration: 0.5, stagger: 0.08, ease: "power1.out" },
          "-=0.25",
        )
        .from(
          subheadRef.current,
          { opacity: 0, y: 10, duration: 0.4, ease: "power1.out" },
          "-=0.3",
        );
    });

    return () => mm.revert();
  }, []);

  return (
    <div className={className}>
      <div ref={eyebrowRef}>
        <Eyebrow className="text-[var(--color-lana-dorada)]">{eyebrow}</Eyebrow>
      </div>
      <h1 className="font-display text-4xl md:text-6xl mt-2">
        <span aria-label={headline}>
          <span ref={headlineWordsRef} aria-hidden="true">
            {headlineNodes}
          </span>
        </span>
      </h1>
      <p ref={subheadRef} className="font-body text-lg mt-2 max-w-md">
        {subhead}
      </p>
    </div>
  );
}
