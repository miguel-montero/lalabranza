import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleToggle } from "./locale-toggle";

describe("LocaleToggle", () => {
  it("links to the same path under the other locale", () => {
    render(<LocaleToggle currentLocale="en" pathname="/en/menu" />);
    const link = screen.getByRole("link", { name: "Español" });
    expect(link).toHaveAttribute("href", "/es/menu");
  });

  it("links to English when currently on the Spanish site", () => {
    render(<LocaleToggle currentLocale="es" pathname="/es/gallery" />);
    const link = screen.getByRole("link", { name: "English" });
    expect(link).toHaveAttribute("href", "/en/gallery");
  });
});
