import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevealImage } from "./reveal-image";

describe("RevealImage", () => {
  it("always renders its children in the DOM, regardless of animation state", () => {
    render(
      <RevealImage>
        <img src="/photo.webp" alt="A photo" />
      </RevealImage>,
    );
    expect(screen.getByAltText("A photo")).toBeInTheDocument();
  });
});
