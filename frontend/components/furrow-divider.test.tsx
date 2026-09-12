import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FurrowDivider } from "./furrow-divider";

describe("FurrowDivider", () => {
  it("renders an svg with role img and a hidden accessible description", () => {
    const { container } = render(<FurrowDivider />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("defaults to the divider variant with high-opacity strokes", () => {
    const { container } = render(<FurrowDivider />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThanOrEqual(2);
    paths.forEach((p) => {
      expect(Number(p.getAttribute("stroke-opacity"))).toBeGreaterThanOrEqual(0.85);
    });
  });

  it("uses reduced opacity strokes for the hero variant", () => {
    const { container } = render(<FurrowDivider variant="hero" />);
    const paths = container.querySelectorAll("path");
    paths.forEach((p) => {
      expect(Number(p.getAttribute("stroke-opacity"))).toBeLessThan(0.3);
    });
  });
});
