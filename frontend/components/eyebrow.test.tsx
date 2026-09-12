import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Eyebrow } from "./eyebrow";

describe("Eyebrow", () => {
  it("renders its text in the label font, uppercase, with wide tracking", () => {
    render(<Eyebrow>cocina de campo</Eyebrow>);
    const el = screen.getByText("cocina de campo");
    expect(el.className).toContain("font-label");
    expect(el.className).toContain("uppercase");
    expect(el.className).toContain("tracking-widest");
  });
});
