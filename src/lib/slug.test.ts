import { describe, expect, it } from "vitest";
import { normalizeName, toSlug } from "./slug";

describe("slug helpers", () => {
  it("slugs titles", () => {
    expect(toSlug("Blackstar bedroom Apocalypse")).toBe("blackstar-bedroom-apocalypse");
  });

  it("normalizes equipment names", () => {
    expect(normalizeName("  HT-20R   MkII ")).toBe("ht-20r mkii");
  });
});
