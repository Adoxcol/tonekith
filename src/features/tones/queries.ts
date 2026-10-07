import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  artists,
  audioDemos,
  comments,
  equipmentModels,
  favorites,
  profiles,
  ratings,
  signalChainItems,
  signalChains,
  songs,
  parameterValues,
  presetFiles,
  toneScreenshots,
  tones,
  users,
} from "@/db/schema";

export async function getPublishedTones(opts?: {
  limit?: number;
  sort?: "newest" | "top" | "tried" | "saved";
  songId?: string;
  platform?: string;
  toneType?: string;
  minRating?: number;
}) {
  const limit = opts?.limit ?? 24;
  const conditions = [
    eq(tones.status, "PUBLISHED"),
    eq(tones.visibility, "PUBLIC"),
  ];
  if (opts?.songId) conditions.push(eq(tones.songId, opts.songId));
  if (opts?.platform) conditions.push(eq(tones.platform, opts.platform));
  if (opts?.toneType) conditions.push(eq(tones.toneType, opts.toneType as never));
  if (opts?.minRating) {
    conditions.push(sql`${tones.avgRating} >= ${opts.minRating}`);
  }

  let orderBy;
  switch (opts?.sort) {
    case "top":
      orderBy = desc(tones.avgRating);
      break;
    case "tried":
      orderBy = desc(tones.tryCount);
      break;
    case "saved":
      orderBy = desc(tones.favoriteCount);
      break;
    default:
      orderBy = desc(tones.publishedAt);
  }

  return db
    .select({
      tone: tones,
      song: songs,
      artist: artists,
      creatorName: profiles.displayName,
      creatorId: profiles.userId,
    })
    .from(tones)
    .innerJoin(songs, eq(tones.songId, songs.id))
    .innerJoin(artists, eq(songs.artistId, artists.id))
    .innerJoin(profiles, eq(tones.creatorId, profiles.userId))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit);
}

export async function getToneBySlug(creatorSlugOrId: string, toneSlug: string) {
  // creatorSlugOrId can be user id or we look up by tone slug + creator
  const rows = await db
    .select({
      tone: tones,
      song: songs,
      artist: artists,
      creator: profiles,
      guitar: equipmentModels,
    })
    .from(tones)
    .innerJoin(songs, eq(tones.songId, songs.id))
    .innerJoin(artists, eq(songs.artistId, artists.id))
    .innerJoin(profiles, eq(tones.creatorId, profiles.userId))
    .leftJoin(equipmentModels, eq(tones.guitarEquipmentId, equipmentModels.id))
    .where(and(eq(tones.slug, toneSlug), eq(tones.creatorId, creatorSlugOrId)))
    .limit(1);

  if (rows[0]) return rows[0];

  // fallback: match by tone id
  const byId = await db
    .select({
      tone: tones,
      song: songs,
      artist: artists,
      creator: profiles,
      guitar: equipmentModels,
    })
    .from(tones)
    .innerJoin(songs, eq(tones.songId, songs.id))
    .innerJoin(artists, eq(songs.artistId, artists.id))
    .innerJoin(profiles, eq(tones.creatorId, profiles.userId))
    .leftJoin(equipmentModels, eq(tones.guitarEquipmentId, equipmentModels.id))
    .where(eq(tones.id, creatorSlugOrId))
    .limit(1);

  return byId[0] ?? null;
}

export async function getToneDetail(toneId: string) {
  const base = await db
    .select({
      tone: tones,
      song: songs,
      artist: artists,
      creator: profiles,
    })
    .from(tones)
    .innerJoin(songs, eq(tones.songId, songs.id))
    .innerJoin(artists, eq(songs.artistId, artists.id))
    .innerJoin(profiles, eq(tones.creatorId, profiles.userId))
    .where(eq(tones.id, toneId))
    .limit(1);

  if (!base[0]) return null;

  const [chain] = await db
    .select()
    .from(signalChains)
    .where(eq(signalChains.toneId, toneId))
    .limit(1);

  let items: Array<{
    item: typeof signalChainItems.$inferSelect;
    equipment: typeof equipmentModels.$inferSelect | null;
    parameters: (typeof parameterValues.$inferSelect)[];
  }> = [];

  if (chain) {
    const chainItems = await db
      .select({
        item: signalChainItems,
        equipment: equipmentModels,
      })
      .from(signalChainItems)
      .leftJoin(equipmentModels, eq(signalChainItems.equipmentModelId, equipmentModels.id))
      .where(eq(signalChainItems.signalChainId, chain.id))
      .orderBy(signalChainItems.position);

    items = await Promise.all(
      chainItems.map(async (row) => ({
        ...row,
        parameters: await db
          .select()
          .from(parameterValues)
          .where(eq(parameterValues.signalChainItemId, row.item.id)),
      })),
    );
  }

  const [screenshots, presets, audios, toneComments, amp] = await Promise.all([
    db
      .select()
      .from(toneScreenshots)
      .where(eq(toneScreenshots.toneId, toneId))
      .orderBy(toneScreenshots.sortOrder),
    db.select().from(presetFiles).where(eq(presetFiles.toneId, toneId)),
    db.select().from(audioDemos).where(eq(audioDemos.toneId, toneId)),
    db
      .select({
        comment: comments,
        author: profiles,
      })
      .from(comments)
      .innerJoin(profiles, eq(comments.userId, profiles.userId))
      .where(and(eq(comments.toneId, toneId), sql`${comments.deletedAt} is null`))
      .orderBy(desc(comments.createdAt)),
    base[0].tone.ampEquipmentId
      ? db
          .select()
          .from(equipmentModels)
          .where(eq(equipmentModels.id, base[0].tone.ampEquipmentId))
          .limit(1)
      : Promise.resolve([]),
  ]);

  let forkedFrom: typeof tones.$inferSelect | null = null;
  if (base[0].tone.forkedFromToneId) {
    const [orig] = await db
      .select()
      .from(tones)
      .where(eq(tones.id, base[0].tone.forkedFromToneId))
      .limit(1);
    forkedFrom = orig ?? null;
  }

  return {
    ...base[0],
    amp: amp[0] ?? null,
    chain,
    items,
    screenshots,
    presets,
    audios,
    comments: toneComments,
    forkedFrom,
  };
}

export async function searchAll(query: string, limit = 8) {
  const q = `%${query}%`;
  const [artistRows, songRows, toneRows, userRows] = await Promise.all([
    db
      .select()
      .from(artists)
      .where(ilike(artists.name, q))
      .limit(limit),
    db
      .select({ song: songs, artist: artists })
      .from(songs)
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .where(or(ilike(songs.title, q), ilike(artists.name, q)))
      .limit(limit),
    db
      .select({
        tone: tones,
        song: songs,
        artist: artists,
      })
      .from(tones)
      .innerJoin(songs, eq(tones.songId, songs.id))
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .where(
        and(
          eq(tones.status, "PUBLISHED"),
          eq(tones.visibility, "PUBLIC"),
          or(ilike(tones.title, q), ilike(songs.title, q), ilike(artists.name, q)),
        ),
      )
      .limit(limit),
    db
      .select({ profile: profiles, user: users })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(or(ilike(profiles.displayName, q), ilike(users.name, q)))
      .limit(limit),
  ]);

  return { artists: artistRows, songs: songRows, tones: toneRows, users: userRows };
}

export async function getUserToneInteraction(userId: string, toneId: string) {
  const { toneTries } = await import("@/db/schema");
  const [fav, rating, tryRows] = await Promise.all([
    db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.toneId, toneId)))
      .limit(1),
    db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.toneId, toneId)))
      .limit(1),
    db
      .select()
      .from(toneTries)
      .where(and(eq(toneTries.userId, userId), eq(toneTries.toneId, toneId)))
      .limit(1),
  ]);

  return {
    favorited: !!fav[0],
    rating: rating[0] ?? null,
    tried: !!tryRows[0],
  };
}
