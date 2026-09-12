import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";
import { restaurantContent } from "@/content/restaurant";

describe("HomePage", () => {
  it("renders the headline, subhead, and a reservations CTA for English", async () => {
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(screen.getByRole("heading", { name: "La Labranza" })).toBeInTheDocument();
    expect(
      screen.getByText("A tableside table — dinner cooked, explained, and poured in front of you."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reserve your seating" })).toHaveAttribute(
      "href",
      "/en/reservations",
    );
  });

  it("renders the hero photo with descriptive alt text", async () => {
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(
      screen.getByAltText(restaurantContent.en.heroPhoto.alt),
    ).toBeInTheDocument();
  });
});
