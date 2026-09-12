import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "./page";
import { restaurantContent } from "@/content/restaurant";

describe("AboutPage", () => {
  it("renders the address and hours", async () => {
    const Page = await AboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(screen.getByText(restaurantContent.en.address)).toBeInTheDocument();
    expect(screen.getByText(restaurantContent.en.hours)).toBeInTheDocument();
  });

  it("embeds a map iframe", async () => {
    const Page = await AboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(screen.getByTitle("Location map")).toBeInTheDocument();
  });
});
