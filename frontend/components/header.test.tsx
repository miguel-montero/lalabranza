import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./header";
import { getDictionary } from "@/content/get-dictionary";

describe("Header", () => {
  it("renders every nav link from the dictionary", async () => {
    const dict = await getDictionary("en");
    render(<Header dictionary={dict} locale="en" pathname="/en" />);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/en/menu");
    expect(screen.getByRole("link", { name: "Reservations" })).toHaveAttribute(
      "href",
      "/en/reservations",
    );
  });
});
