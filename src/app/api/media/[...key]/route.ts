import { NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { LocalObjectStorage } from "@/lib/storage/local";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ key: string[] }> },
) {
  const { key } = await ctx.params;
  const storageKey = key.join("/");
  const storage = getStorage();

  if (!(storage instanceof LocalObjectStorage) || !storage.getBuffer) {
    return NextResponse.redirect(storage.getUrl(storageKey));
  }

  try {
    const buf = await storage.getBuffer(storageKey);
    const ext = storageKey.split(".").pop()?.toLowerCase();
    const type =
      ext === "png"
        ? "image/png"
        : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "webp"
            ? "image/webp"
            : ext === "mp3"
              ? "audio/mpeg"
              : ext === "wav"
                ? "audio/wav"
                : "application/octet-stream";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
