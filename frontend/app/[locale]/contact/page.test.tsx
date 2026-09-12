import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage from "./page";
import { restaurantContent } from "@/content/restaurant";

describe("ContactPage", () => {
  it("renders working tel: and mailto: links", async () => {
    const Page = await ContactPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    const { phone, email } = restaurantContent.en;
    expect(screen.getByRole("link", { name: phone })).toHaveAttribute(
      "href",
      `tel:${phone.replace(/\s+/g, "")}`,
    );
    expect(screen.getByRole("link", { name: email })).toHaveAttribute("href", `mailto:${email}`);
  });
});
