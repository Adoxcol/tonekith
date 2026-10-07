"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import {
  favorites,
  parameterValues,
  ratings,
  signalChainItems,
  signalChains,
  toneFeedback,
  toneTries,
  toneVersions,
  tones,
} from "@/db/schema";
import { trackEvent } from "@/lib/analytics";
import { toSlug } from "@/lib/slug";
import { requireSession } from "@/server/session";
import {
  commentSchema,
  createToneSchema,
  feedbackSchema,
  ratingSchema,
  saveChainSchema,
  updateToneSchema,
} from "@/validation/tone";
import { comments } from "@/db/schema";

export async function createToneAction(input: unknown) {
  const session = await requireSession();
  const data = createToneSchema.parse(input);
  const slug = toSlug(data.title);

  const [tone] = await db
    .insert(tones)
    .values({
      creatorId: session.user.id,
      songId: data.songId,
      title: data.title,
      slug,
      description: data.description,
      toneType: data.toneType,
      songSection: data.songSection,
      visibility: data.visibility,
      difficulty: data.difficulty ?? null,
      tuning: data.tuning ?? "EADGBE",
      capo: data.capo ?? 0,
      bpm: data.bpm ?? null,
      notes: data.notes,
      platform: data.platform,
      guitarEquipmentId: data.guitarEquipmentId ?? null,
      ampEquipmentId: data.ampEquipmentId ?? null,
      status: "DRAFT",
    })
    .returning();

  await db.insert(signalChains).values({ toneId: tone.id, name: "Main" });
  revalidatePath("/tones");
  return { ok: true as const, tone };
}

export async function updateToneAction(input: unknown) {
  const session = await requireSession();
  const data = updateToneSchema.parse(input);
  const [existing] = await db.select().from(tones).where(eq(tones.id, data.id)).limit(1);
  if (!existing) throw new Error("Tone not found");
  if (existing.creatorId !== session.user.id) throw new Error("Forbidden");

  const { id, ...rest } = data;
  const patch: Partial<typeof tones.$inferInsert> = { ...rest, updatedAt: new Date() };
  if (rest.title) patch.slug = toSlug(rest.title);

  if (existing.status === "PUBLISHED" && (rest.title || rest.notes || rest.description)) {
    const versions = await db
      .select()
      .from(toneVersions)
      .where(eq(toneVersions.toneId, id));
    await db.insert(toneVersions).values({
      toneId: id,
      versionNumber: versions.length + 1,
      snapshot: existing as unknown as Record<string, unknown>,
      changeSummary: "Autosnapshot before edit",
      createdByUserId: session.user.id,
    });
  }

  const [tone] = await db.update(tones).set(patch).where(eq(tones.id, id)).returning();
  revalidatePath(`/tones/${tone.id}`);
  return { ok: true as const, tone };
}

export async function publishToneAction(toneId: string) {
  const session = await requireSession();
  const [existing] = await db.select().from(tones).where(eq(tones.id, toneId)).limit(1);
  if (!existing) throw new Error("Tone not found");
  if (existing.creatorId !== session.user.id) throw new Error("Forbidden");

  const [tone] = await db
    .update(tones)
    .set({ status: "PUBLISHED", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(tones.id, toneId))
    .returning();

  await trackEvent({
    eventType: "tone_published",
    userId: session.user.id,
    toneId,
  });
  revalidatePath(`/tones/${toneId}`);
  revalidatePath(`/songs`);
  return { ok: true as const, tone };
}

export async function saveSignalChainAction(input: unknown) {
  const session = await requireSession();
  const data = saveChainSchema.parse(input);
  const [tone] = await db.select().from(tones).where(eq(tones.id, data.toneId)).limit(1);
  if (!tone) throw new Error("Tone not found");
  if (tone.creatorId !== session.user.id) throw new Error("Forbidden");

  let [chain] = await db
    .select()
    .from(signalChains)
    .where(eq(signalChains.toneId, data.toneId))
    .limit(1);
  if (!chain) {
    [chain] = await db
      .insert(signalChains)
      .values({ toneId: data.toneId, name: "Main" })
      .returning();
  }

  await db.delete(signalChainItems).where(eq(signalChainItems.signalChainId, chain.id));

  for (const [position, item] of data.items.entries()) {
    const [row] = await db
      .insert(signalChainItems)
      .values({
        signalChainId: chain.id,
        position,
        label: item.label,
        itemType: item.itemType,
        equipmentModelId: item.equipmentModelId ?? null,
        isEnabled: item.isEnabled,
        isSoftware: item.isSoftware,
        notes: item.notes ?? null,
      })
      .returning();

    if (item.parameters?.length) {
      await db.insert(parameterValues).values(
        item.parameters.map((p) => ({
          signalChainItemId: row.id,
          key: p.key,
          dataType: p.dataType,
          valueNumber: p.valueNumber ?? null,
          valueBoolean: p.valueBoolean ?? null,
          valueText: p.valueText ?? null,
          valueEnum: p.valueEnum ?? null,
        })),
      );
    }
  }

  revalidatePath(`/tones/${data.toneId}`);
  revalidatePath(`/tones/${data.toneId}/edit`);
  return { ok: true as const };
}

export async function rateToneAction(input: unknown) {
  const session = await requireSession();
  const data = ratingSchema.parse(input);

  await db
    .insert(ratings)
    .values({
      userId: session.user.id,
      toneId: data.toneId,
      overall: data.overall,
      accuracy: data.accuracy,
      soundQuality: data.soundQuality,
      usefulness: data.usefulness,
    })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.toneId],
      set: {
        overall: data.overall,
        accuracy: data.accuracy,
        soundQuality: data.soundQuality,
        usefulness: data.usefulness,
        updatedAt: new Date(),
      },
    });

  const [agg] = await db
    .select({
      avg: sql<number>`avg(${ratings.overall})`,
      count: sql<number>`count(*)`,
    })
    .from(ratings)
    .where(eq(ratings.toneId, data.toneId));

  await db
    .update(tones)
    .set({
      avgRating: Number(agg?.avg ?? 0),
      ratingCount: Number(agg?.count ?? 0),
    })
    .where(eq(tones.id, data.toneId));

  await trackEvent({
    eventType: "tone_rated",
    userId: session.user.id,
    toneId: data.toneId,
    payload: { overall: data.overall, accuracy: data.accuracy },
  });
  revalidatePath(`/tones/${data.toneId}`);
  return { ok: true as const };
}

export async function toggleFavoriteAction(toneId: string) {
  const session = await requireSession();
  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, session.user.id), eq(favorites.toneId, toneId)))
    .limit(1);

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
    await db
      .update(tones)
      .set({ favoriteCount: sql`greatest(${tones.favoriteCount} - 1, 0)` })
      .where(eq(tones.id, toneId));
  } else {
    await db.insert(favorites).values({ userId: session.user.id, toneId });
    await db
      .update(tones)
      .set({ favoriteCount: sql`${tones.favoriteCount} + 1` })
      .where(eq(tones.id, toneId));
    await trackEvent({
      eventType: "tone_saved",
      userId: session.user.id,
      toneId,
    });
  }
  revalidatePath(`/tones/${toneId}`);
  return { ok: true as const, favorited: !existing };
}

export async function markTriedAction(toneId: string) {
  const session = await requireSession();
  await db
    .insert(toneTries)
    .values({ userId: session.user.id, toneId })
    .onConflictDoNothing();
  await db
    .update(tones)
    .set({ tryCount: sql`${tones.tryCount} + 1` })
    .where(eq(tones.id, toneId));
  await trackEvent({ eventType: "tone_tried", userId: session.user.id, toneId });
  revalidatePath(`/tones/${toneId}`);
  return { ok: true as const };
}

export async function submitFeedbackAction(input: unknown) {
  const session = await requireSession();
  const data = feedbackSchema.parse(input);
  await db.insert(toneFeedback).values({
    userId: session.user.id,
    toneId: data.toneId,
    tags: data.tags,
    comment: data.comment,
  });
  revalidatePath(`/tones/${data.toneId}`);
  return { ok: true as const };
}

export async function addCommentAction(input: unknown) {
  const session = await requireSession();
  const data = commentSchema.parse(input);
  const [row] = await db
    .insert(comments)
    .values({
      toneId: data.toneId,
      userId: session.user.id,
      body: data.body,
      parentId: data.parentId ?? null,
    })
    .returning();
  revalidatePath(`/tones/${data.toneId}`);
  return { ok: true as const, comment: row };
}

export async function deleteCommentAction(commentId: string) {
  const session = await requireSession();
  const [existing] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (!existing) throw new Error("Not found");
  if (existing.userId !== session.user.id) throw new Error("Forbidden");
  await db
    .update(comments)
    .set({ deletedAt: new Date(), body: "[deleted]" })
    .where(eq(comments.id, commentId));
  revalidatePath(`/tones/${existing.toneId}`);
  return { ok: true as const };
}

export async function forkToneAction(toneId: string) {
  const session = await requireSession();
  const [source] = await db.select().from(tones).where(eq(tones.id, toneId)).limit(1);
  if (!source || source.status !== "PUBLISHED") throw new Error("Tone not found");

  const title = `${source.title} (fork)`;
  const [forked] = await db
    .insert(tones)
    .values({
      creatorId: session.user.id,
      songId: source.songId,
      title,
      slug: toSlug(`${title}-${Date.now()}`),
      description: source.description,
      toneType: source.toneType,
      songSection: source.songSection,
      status: "DRAFT",
      visibility: "PUBLIC",
      difficulty: source.difficulty,
      tuning: source.tuning,
      capo: source.capo,
      bpm: source.bpm,
      notes: source.notes,
      platform: source.platform,
      guitarEquipmentId: source.guitarEquipmentId,
      ampEquipmentId: source.ampEquipmentId,
      forkedFromToneId: source.id,
    })
    .returning();

  const [srcChain] = await db
    .select()
    .from(signalChains)
    .where(eq(signalChains.toneId, source.id))
    .limit(1);

  if (srcChain) {
    const [newChain] = await db
      .insert(signalChains)
      .values({ toneId: forked.id, name: srcChain.name })
      .returning();
    const items = await db
      .select()
      .from(signalChainItems)
      .where(eq(signalChainItems.signalChainId, srcChain.id));

    for (const item of items) {
      const [newItem] = await db
        .insert(signalChainItems)
        .values({
          signalChainId: newChain.id,
          position: item.position,
          label: item.label,
          itemType: item.itemType,
          equipmentModelId: item.equipmentModelId,
          isEnabled: item.isEnabled,
          isSoftware: item.isSoftware,
          notes: item.notes,
        })
        .returning();
      const params = await db
        .select()
        .from(parameterValues)
        .where(eq(parameterValues.signalChainItemId, item.id));
      if (params.length) {
        await db.insert(parameterValues).values(
          params.map((p) => ({
            signalChainItemId: newItem.id,
            parameterDefinitionId: p.parameterDefinitionId,
            key: p.key,
            dataType: p.dataType,
            valueNumber: p.valueNumber,
            valueBoolean: p.valueBoolean,
            valueText: p.valueText,
            valueEnum: p.valueEnum,
          })),
        );
      }
    }
  } else {
    await db.insert(signalChains).values({ toneId: forked.id, name: "Main" });
  }

  await trackEvent({
    eventType: "tone_forked",
    userId: session.user.id,
    toneId: source.id,
    payload: { forkId: forked.id },
  });

  revalidatePath(`/tones/${forked.id}`);
  return { ok: true as const, tone: forked };
}
