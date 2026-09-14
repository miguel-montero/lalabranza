"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeadingReveal } from "./heading-reveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * A full-bleed photo panel, its image scrubbed from a slight zoom down
 * to rest as the panel itself scrolls through the viewport -- unlike
 * Reveal/RevealImage's one-time triggered settle, this ties directly
 * to scroll position for as long as the panel is in view, the same
 * "does something as you scroll" quality as TaglineReveal on the
 * closing section. Gated behind prefers-reduced-motion: the image
 * renders at its resting scale by default and only ties to scroll
 * when motion is allowed.
 */
export function CinematicStorySection({
  title,
  body,
  photo,
  align = "left",
}: {
  title: string;
  body: string;
  photo: { src: string; alt: string };
  align?: "left" | "right";
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        image,
        { scale: 1.25 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        },
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[90vh] min-h-[560px] w-full overflow-hidden">
      <div ref={imageRef} className="absolute inset-0">
        <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[var(--color-piedra-volcanica)]/90 via-[var(--color-piedra-volcanica)]/10 to-transparent"
      />
      <div
        className={`absolute bottom-12 md:bottom-16 max-w-xl text-[var(--color-fibra-cruda)] ${
          align === "left" ? "left-6 md:left-12 right-6 md:right-auto" : "right-6 md:right-12 left-6 md:left-auto"
        }`}
      >
        <HeadingReveal as="h2" className="font-display text-4xl md:text-6xl leading-[0.98]" text={title} />
        <p className="font-body text-lg md:text-xl mt-4">{body}</p>
      </div>
    </section>
  );
}
