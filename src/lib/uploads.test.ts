import { describe, expect, it } from "vitest";
import { validateUpload } from "./uploads";

describe("validateUpload", () => {
  it("accepts a valid screenshot", () => {
    const res = validateUpload("screenshot", {
      name: "rig.png",
      type: "image/png",
      size: 1024,
    });
    expect(res.ok).toBe(true);
  });

  it("rejects oversized audio", () => {
    const res = validateUpload("audio", {
      name: "demo.mp3",
      type: "audio/mpeg",
      size: 20 * 1024 * 1024,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/too large/i);
  });

  it("rejects bad preset extension", () => {
    const res = validateUpload("preset", {
      name: "evil.exe",
      type: "application/octet-stream",
      size: 100,
    });
    expect(res.ok).toBe(false);
  });
});
