import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

describe("shadcn/ui smoke test", () => {
  it("renders a Button", () => {
    render(<Button>Reserve a table</Button>);
    expect(screen.getByRole("button", { name: "Reserve a table" })).toBeInTheDocument();
  });

  it("renders a Badge", () => {
    render(<Badge>Pending</Badge>);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
