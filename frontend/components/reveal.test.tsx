import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "./reveal";

describe("Reveal", () => {
  it("always renders its children in the DOM, regardless of animation state", () => {
    // The correctness property that matters and is actually testable in
    // jsdom: content must never be hidden-by-default waiting on GSAP/
    // ScrollTrigger, which don't meaningfully run here (no real scrolling
    // or layout). The actual scroll-triggered fade is verified manually
    // against the running dev server, the same way this project verifies
    // PHP endpoints manually rather than through jsdom.
    render(
      <Reveal>
        <p>Real content</p>
      </Reveal>,
    );
    expect(screen.getByText("Real content")).toBeInTheDocument();
  });
});
