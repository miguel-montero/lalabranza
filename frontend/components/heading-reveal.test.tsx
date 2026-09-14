import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeadingReveal } from "./heading-reveal";

describe("HeadingReveal", () => {
  it("exposes the full sentence as one accessible heading, not fragmented words", () => {
    render(<HeadingReveal text="A name born from the land" />);
    expect(
      screen.getByRole("heading", { name: "A name born from the land" }),
    ).toBeInTheDocument();
  });

  it("hides the decorative per-word markup from assistive technology", () => {
    const { container } = render(<HeadingReveal text="A name born from the land" />);
    const decorative = container.querySelector('[aria-hidden="true"]');
    expect(decorative).toBeInTheDocument();
  });
});
