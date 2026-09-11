import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins truthy class names with a space", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });

  it("lets a later conflicting Tailwind class win", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
