import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia at all. GSAP's ScrollTrigger plugin
// calls it during registration (not just when actually querying reduced
// motion), so anything importing components/reveal.tsx or
// furrow-divider.tsx would throw without this. Reports "no match" for
// every query, which is the safe default for jsdom's non-scrolling,
// non-rendering environment.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
