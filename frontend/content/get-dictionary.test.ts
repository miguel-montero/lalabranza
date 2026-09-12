import { describe, it, expect } from "vitest";
import { getDictionary } from "./get-dictionary";

describe("getDictionary", () => {
  it("returns the English dictionary with expected top-level keys", async () => {
    const dict = await getDictionary("en");
    expect(Object.keys(dict)).toEqual(
      expect.arrayContaining(["nav", "home", "reservations", "footer"]),
    );
    expect(dict.nav.menu).toBe("Menu");
  });

  it("returns the Spanish dictionary with the same shape", async () => {
    const en = await getDictionary("en");
    const es = await getDictionary("es");
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    expect(es.nav.menu).toBe("Menú");
  });
});
