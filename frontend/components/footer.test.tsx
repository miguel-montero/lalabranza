import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";
import { getDictionary } from "@/content/get-dictionary";

describe("Footer", () => {
  it("credits Viña La Quirinca", async () => {
    const dict = await getDictionary("en");
    render(<Footer dictionary={dict} />);
    expect(screen.getByText("Part of Viña La Quirinca")).toBeInTheDocument();
  });
});
