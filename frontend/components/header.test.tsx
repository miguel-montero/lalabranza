import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./header";
import { getDictionary } from "@/content/get-dictionary";

describe("Header", () => {
  it("reveals every nav link from the dictionary after opening the menu", async () => {
    const dict = await getDictionary("en");
    const user = userEvent.setup();
    render(<Header dictionary={dict} locale="en" pathname="/en" />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/en/menu");
    expect(screen.getByRole("link", { name: "Reservations" })).toHaveAttribute(
      "href",
      "/en/reservations",
    );
  });
});
