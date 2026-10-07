import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { audioDemos, presetFiles, toneScreenshots, tones } from "@/db/schema";
import { getStorage } from "@/lib/storage";
import { validateUpload, type UploadKind } from "@/lib/uploads";
import { getSession } from "@/server/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const toneId = String(form.get("toneId") || "");
  const kind = String(form.get("kind") || "") as UploadKind;
  const file = form.get("file");

  if (!toneId || !file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file or toneId" }, { status: 400 });
  }
  if (!["screenshot", "preset", "audio"].includes(kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const [tone] = await db.select().from(tones).where(eq(tones.id, toneId)).limit(1);
  if (!tone) return NextResponse.json({ error: "Tone not found" }, { status: 404 });
  if (tone.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const check = validateUpload(kind, {
    name: file.name,
    type: file.type,
    size: file.size,
  });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `tones/${toneId}/${kind}/${nanoid(10)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const storage = getStorage();
  const put = await storage.put({
    key,
    body: buffer,
    contentType: file.type || "application/octet-stream",
  });

  if (kind === "screenshot") {
    const existing = await db
      .select()
      .from(toneScreenshots)
      .where(eq(toneScreenshots.toneId, toneId));
    await db.insert(toneScreenshots).values({
      toneId,
      storageKey: put.key,
      caption: null,
      sortOrder: existing.length,
    });
  } else if (kind === "preset") {
    await db.insert(presetFiles).values({
      toneId,
      storageKey: put.key,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      platform: tone.platform,
    });
  } else {
    await db.insert(audioDemos).values({
      toneId,
      storageKey: put.key,
      fileName: file.name,
      contentType: file.type || "audio/mpeg",
      sizeBytes: file.size,
    });
  }

  return NextResponse.json({ ok: true, url: put.url, key: put.key });
}
