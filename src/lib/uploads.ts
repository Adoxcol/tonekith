export const UPLOAD_LIMITS = {
  screenshot: {
    maxBytes: 5 * 1024 * 1024,
    mime: ["image/png", "image/jpeg", "image/webp"],
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
  },
  preset: {
    maxBytes: 2 * 1024 * 1024,
    mime: [
      "application/octet-stream",
      "application/json",
      "text/plain",
      "application/xml",
    ],
    extensions: [".tone", ".preset", ".json", ".nra", ".nam", ".xml", ".tide"],
  },
  audio: {
    maxBytes: 10 * 1024 * 1024,
    mime: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/m4a"],
    extensions: [".mp3", ".wav", ".m4a"],
  },
  avatar: {
    maxBytes: 2 * 1024 * 1024,
    mime: ["image/png", "image/jpeg", "image/webp"],
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_LIMITS;

export function validateUpload(
  kind: UploadKind,
  file: { name: string; type: string; size: number },
): { ok: true } | { ok: false; error: string } {
  const rules = UPLOAD_LIMITS[kind];
  if (file.size > rules.maxBytes) {
    return {
      ok: false,
      error: `File too large (max ${Math.round(rules.maxBytes / 1024 / 1024)}MB)`,
    };
  }
  const lower = file.name.toLowerCase();
  const extOk = rules.extensions.some((ext) => lower.endsWith(ext));
  if (!extOk) {
    return {
      ok: false,
      error: `Unsupported extension. Allowed: ${rules.extensions.join(", ")}`,
    };
  }
  if (file.type && !(rules.mime as readonly string[]).includes(file.type)) {
    // allow octet-stream for presets
    if (!(kind === "preset" && file.type === "application/octet-stream")) {
      if (kind !== "preset") {
        return { ok: false, error: `Unsupported content type: ${file.type}` };
      }
    }
  }
  return { ok: true };
}
