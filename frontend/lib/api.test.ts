import { describe, it, expect, vi, afterEach } from "vitest";
import { checkAvailability } from "./api";

describe("checkAvailability", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed body when the response is ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ remaining: 5 }),
      }),
    );

    const result = await checkAvailability("2026-09-17", "13:00:00");
    expect(result).toEqual({ remaining: 5 });
  });

  it("treats a non-ok response as no confirmed capacity instead of trusting its body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: "date and time_slot are required" }),
      }),
    );

    const result = await checkAvailability("2026-09-17", "13:00:00");
    expect(result).toEqual({ remaining: 0 });
  });
});
