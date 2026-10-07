import { describe, expect, it } from "vitest";
import { createToneSchema, ratingSchema } from "./tone";

describe("tone validation", () => {
  it("parses create tone payload", () => {
    const parsed = createToneSchema.parse({
      songId: "edcc90a3-7797-4a4f-8f55-838eea98a480",
      title: "My tone",
    });
    expect(parsed.toneType).toBe("RECREATION");
    expect(parsed.visibility).toBe("PUBLIC");
  });

  it("rejects invalid rating", () => {
    expect(() =>
      ratingSchema.parse({
        toneId: "edcc90a3-7797-4a4f-8f55-838eea98a480",
        overall: 6,
        accuracy: 5,
        soundQuality: 5,
        usefulness: 5,
      }),
    ).toThrow();
  });
});
