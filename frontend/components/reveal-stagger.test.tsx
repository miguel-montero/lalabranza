import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevealStagger } from "./reveal-stagger";

describe("RevealStagger", () => {
  it("always renders all its items in the DOM, regardless of animation state", () => {
    render(
      <RevealStagger>
        <p data-reveal-item>One</p>
        <p data-reveal-item>Two</p>
        <p data-reveal-item>Three</p>
      </RevealStagger>,
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });
});
