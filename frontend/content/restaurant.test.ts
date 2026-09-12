import { describe, it, expect } from "vitest";
import { restaurantContent } from "./restaurant";

describe("restaurantContent", () => {
  it("has matching menu category counts across locales", () => {
    expect(restaurantContent.es.menu.length).toBe(restaurantContent.en.menu.length);
  });

  it("has a phone and email usable in tel:/mailto: links", () => {
    expect(restaurantContent.en.phone).toMatch(/^\+/);
    expect(restaurantContent.en.email).toContain("@");
  });

  it("has at least one gallery photo entry with alt text", () => {
    expect(restaurantContent.en.gallery.length).toBeGreaterThan(0);
    expect(restaurantContent.en.gallery[0].alt.length).toBeGreaterThan(0);
  });
});
