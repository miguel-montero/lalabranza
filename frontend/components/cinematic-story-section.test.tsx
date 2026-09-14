import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CinematicStorySection } from "./cinematic-story-section";

describe("CinematicStorySection", () => {
  it("always renders its heading, body, and photo, regardless of scroll/animation state", () => {
    render(
      <CinematicStorySection
        title="A name born from the land"
        body="Some story copy."
        photo={{ src: "/images/test.webp", alt: "A vineyard at dusk" }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "A name born from the land" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Some story copy.")).toBeInTheDocument();
    expect(screen.getByAltText("A vineyard at dusk")).toBeInTheDocument();
  });
});
