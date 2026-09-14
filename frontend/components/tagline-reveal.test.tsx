import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TaglineReveal } from "./tagline-reveal";

describe("TaglineReveal", () => {
  it("preserves the full sentence as ordinary readable text, split into words only visually", () => {
    const text = "A taste of Chile, rooted in Maipo.";
    const { container } = render(<TaglineReveal text={text} />);
    const p = container.querySelector("p");
    expect(p).toBeInTheDocument();
    expect(p?.textContent).toBe(text);
  });
});
