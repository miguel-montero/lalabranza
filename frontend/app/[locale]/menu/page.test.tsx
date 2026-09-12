import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MenuPage from "./page";

describe("MenuPage", () => {
  it("renders every category and item with its price", async () => {
    const Page = await MenuPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(screen.getByRole("heading", { name: "To Start" })).toBeInTheDocument();
    expect(screen.getByText("Placeholder empanada")).toBeInTheDocument();
    expect(screen.getByText("$8")).toBeInTheDocument();
  });
});
