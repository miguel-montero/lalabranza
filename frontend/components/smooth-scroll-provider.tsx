"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * The site's one smooth-scroll engine (Lenis — chosen over Locomotive
 * Scroll for its smaller footprint and native GSAP ScrollTrigger
 * recipe). Never initialized under prefers-reduced-motion: reduce —
 * native, immediate scrolling is the correct "final state" there, not
 * a shortened version of the smoothing. Every ScrollTrigger-based
 * reveal elsewhere on the site (Reveal, RevealStagger, FurrowDivider,
 * HeroIntro) keeps working unmodified: this only changes how scroll
 * *position* advances, which ScrollTrigger.update stays in sync with
 * via lenis's own "scroll" event.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
