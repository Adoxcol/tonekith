"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import {
  artists,
  equipmentModels,
  reports,
  songs,
  users,
} from "@/db/schema";
import { toSlug } from "@/lib/slug";
import { requireAdmin } from "@/server/session";

export async function updateReportStatusAction(input: unknown) {
  await requireAdmin();
  const data = z
    .object({
      id: z.string().uuid(),
      status: z.enum(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]),
      notes: z.string().max(2000).optional(),
    })
    .parse(input);
  await db
    .update(reports)
    .set({ status: data.status, notes: data.notes, updatedAt: new Date() })
    .where(eq(reports.id, data.id));
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function createArtistAction(input: unknown) {
  await requireAdmin();
  const data = z
    .object({
      name: z.string().min(1).max(120),
      description: z.string().max(2000).optional(),
    })
    .parse(input);
  const [row] = await db
    .insert(artists)
    .values({
      name: data.name,
      slug: toSlug(data.name),
      description: data.description,
    })
    .returning();
  revalidatePath("/admin");
  revalidatePath("/artists");
  return { ok: true as const, artist: row };
}

export async function createSongAction(input: unknown) {
  await requireAdmin();
  const data = z
    .object({
      artistId: z.string().uuid(),
      title: z.string().min(1).max(160),
      album: z.string().max(160).optional(),
      releaseYear: z.number().int().optional(),
    })
    .parse(input);
  const [row] = await db
    .insert(songs)
    .values({
      artistId: data.artistId,
      title: data.title,
      slug: toSlug(data.title),
      album: data.album,
      releaseYear: data.releaseYear,
    })
    .returning();
  revalidatePath("/admin");
  return { ok: true as const, song: row };
}

export async function verifyEquipmentAction(id: string) {
  await requireAdmin();
  await db
    .update(equipmentModels)
    .set({ isVerified: true })
    .where(eq(equipmentModels.id, id));
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function setUserRoleAction(userId: string, role: "user" | "admin") {
  await requireAdmin();
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function createReportAction(input: unknown) {
  const { requireSession } = await import("@/server/session");
  const session = await requireSession();
  const data = z
    .object({
      targetType: z.enum(["TONE", "COMMENT", "USER", "EQUIPMENT"]),
      targetId: z.string().min(1),
      reason: z.string().min(3).max(2000),
    })
    .parse(input);
  await db.insert(reports).values({
    reporterId: session.user.id,
    targetType: data.targetType,
    targetId: data.targetId,
    reason: data.reason,
  });
  return { ok: true as const };
}
