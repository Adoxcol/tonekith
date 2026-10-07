"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { equipmentManufacturers, equipmentModels, profiles, userGear } from "@/db/schema";
import { normalizeName } from "@/lib/slug";
import { requireSession } from "@/server/session";

const addGearSchema = z.object({
  equipmentModelId: z.string().uuid(),
  nickname: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
  isPrimary: z.boolean().optional(),
});

export async function addUserGearAction(input: unknown) {
  const session = await requireSession();
  const data = addGearSchema.parse(input);
  await db.insert(userGear).values({
    userId: session.user.id,
    equipmentModelId: data.equipmentModelId,
    nickname: data.nickname,
    notes: data.notes,
    isPrimary: data.isPrimary ?? false,
  });
  revalidatePath("/gear");
  revalidatePath(`/u/${session.user.id}`);
  return { ok: true as const };
}

export async function removeUserGearAction(id: string) {
  const session = await requireSession();
  const [row] = await db.select().from(userGear).where(eq(userGear.id, id)).limit(1);
  if (!row || row.userId !== session.user.id) throw new Error("Forbidden");
  await db.delete(userGear).where(eq(userGear.id, id));
  revalidatePath("/gear");
  return { ok: true as const };
}

export async function submitEquipmentAction(input: unknown) {
  const session = await requireSession();
  const schema = z.object({
    manufacturerName: z.string().min(1).max(80),
    modelName: z.string().min(1).max(120),
    category: z.enum([
      "GUITAR",
      "AMP",
      "AMP_SIM",
      "CABINET",
      "PEDAL",
      "MULTI_EFFECT",
      "PLUGIN",
      "AUDIO_INTERFACE",
      "MICROPHONE",
      "OTHER",
    ]),
    description: z.string().max(2000).optional(),
  });
  const data = schema.parse(input);
  const normMfg = normalizeName(data.manufacturerName);

  let [mfg] = await db
    .select()
    .from(equipmentManufacturers)
    .where(eq(equipmentManufacturers.normalizedName, normMfg))
    .limit(1);
  if (!mfg) {
    [mfg] = await db
      .insert(equipmentManufacturers)
      .values({ name: data.manufacturerName.trim(), normalizedName: normMfg })
      .returning();
  }

  const [model] = await db
    .insert(equipmentModels)
    .values({
      manufacturerId: mfg.id,
      name: data.modelName.trim(),
      normalizedName: normalizeName(data.modelName),
      category: data.category,
      description: data.description,
      isVerified: false,
      submittedByUserId: session.user.id,
    })
    .onConflictDoNothing()
    .returning();

  revalidatePath("/gear");
  return { ok: true as const, model };
}

export async function updateProfileAction(input: unknown) {
  const session = await requireSession();
  const schema = z.object({
    displayName: z.string().min(1).max(80),
    bio: z.string().max(2000).optional(),
    location: z.string().max(120).optional(),
    website: z.string().max(200).optional(),
    allowDatasetUse: z.boolean(),
    allowAudioTrainingUse: z.boolean(),
  });
  const data = schema.parse(input);
  await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.userId, session.user.id));
  revalidatePath(`/u/${session.user.id}`);
  return { ok: true as const };
}

export async function getGearForUser(userId: string) {
  return db
    .select({
      gear: userGear,
      model: equipmentModels,
      manufacturer: equipmentManufacturers,
    })
    .from(userGear)
    .innerJoin(equipmentModels, eq(userGear.equipmentModelId, equipmentModels.id))
    .innerJoin(
      equipmentManufacturers,
      eq(equipmentModels.manufacturerId, equipmentManufacturers.id),
    )
    .where(eq(userGear.userId, userId));
}

export async function searchEquipment(query: string) {
  const { ilike, or } = await import("drizzle-orm");
  const q = `%${query}%`;
  return db
    .select({
      model: equipmentModels,
      manufacturer: equipmentManufacturers,
    })
    .from(equipmentModels)
    .innerJoin(
      equipmentManufacturers,
      eq(equipmentModels.manufacturerId, equipmentManufacturers.id),
    )
    .where(or(ilike(equipmentModels.name, q), ilike(equipmentManufacturers.name, q)))
    .limit(30);
}

// silence unused import lint for and if unused
void and;
