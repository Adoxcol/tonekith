import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { presetFiles } from "@/db/schema";
import { trackEvent } from "@/lib/analytics";
import { getStorage } from "@/lib/storage";
import { LocalObjectStorage } from "@/lib/storage/local";
import { getSession } from "@/server/session";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const [preset] = await db.select().from(presetFiles).where(eq(presetFiles.id, id)).limit(1);
  if (!preset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getSession();
  await trackEvent({
    eventType: "preset_downloaded",
    userId: session?.user?.id,
    toneId: preset.toneId,
    payload: { presetId: preset.id },
  });

  const storage = getStorage();
  if (storage instanceof LocalObjectStorage && storage.getBuffer) {
    const buf = await storage.getBuffer(preset.storageKey);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": preset.contentType,
        "Content-Disposition": `attachment; filename="${preset.fileName}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  return NextResponse.redirect(storage.getUrl(preset.storageKey));
}
