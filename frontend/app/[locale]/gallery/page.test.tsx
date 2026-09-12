import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GalleryPage from "./page";
import { restaurantContent } from "@/content/restaurant";

describe("GalleryPage", () => {
  it("renders one image per gallery entry with its alt text", async () => {
    const Page = await GalleryPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    for (const photo of restaurantContent.en.gallery) {
      expect(screen.getByAltText(photo.alt)).toBeInTheDocument();
    }
  });
});
