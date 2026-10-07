import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { equipmentModels, songs, tags } from "./catalog";
import {
  chainItemTypeEnum,
  parameterDataTypeEnum,
  songSectionEnum,
  toneStatusEnum,
  toneTypeEnum,
  toneVisibilityEnum,
} from "./enums";

export const tones = pgTable(
  "tones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: text("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    songId: uuid("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    toneType: toneTypeEnum("tone_type").notNull().default("RECREATION"),
    songSection: songSectionEnum("song_section").notNull().default("FULL_SONG"),
    status: toneStatusEnum("status").notNull().default("DRAFT"),
    visibility: toneVisibilityEnum("visibility").notNull().default("PUBLIC"),
    difficulty: integer("difficulty"),
    tuning: text("tuning").default("EADGBE"),
    capo: integer("capo").default(0),
    bpm: integer("bpm"),
    notes: text("notes"),
    platform: text("platform"),
    guitarEquipmentId: uuid("guitar_equipment_id").references(() => equipmentModels.id, {
      onDelete: "set null",
    }),
    ampEquipmentId: uuid("amp_equipment_id").references(() => equipmentModels.id, {
      onDelete: "set null",
    }),
    forkedFromToneId: uuid("forked_from_tone_id"),
    avgRating: doublePrecision("avg_rating").default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    tryCount: integer("try_count").notNull().default(0),
    favoriteCount: integer("favorite_count").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tones_creator_slug_idx").on(t.creatorId, t.slug)],
);

export const toneVersions = pgTable("tone_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  toneId: uuid("tone_id")
    .notNull()
    .references(() => tones.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  changeSummary: text("change_summary"),
  createdByUserId: text("created_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const signalChains = pgTable("signal_chains", {
  id: uuid("id").defaultRandom().primaryKey(),
  toneId: uuid("tone_id")
    .notNull()
    .references(() => tones.id, { onDelete: "cascade" })
    .unique(),
  name: text("name").notNull().default("Main"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const signalChainItems = pgTable("signal_chain_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  signalChainId: uuid("signal_chain_id")
    .notNull()
    .references(() => signalChains.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  equipmentModelId: uuid("equipment_model_id").references(() => equipmentModels.id, {
    onDelete: "set null",
  }),
  label: text("label").notNull(),
  itemType: chainItemTypeEnum("item_type").notNull().default("OTHER"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  isSoftware: boolean("is_software").notNull().default(false),
  notes: text("notes"),
});

export const parameterValues = pgTable("parameter_values", {
  id: uuid("id").defaultRandom().primaryKey(),
  signalChainItemId: uuid("signal_chain_item_id")
    .notNull()
    .references(() => signalChainItems.id, { onDelete: "cascade" }),
  parameterDefinitionId: uuid("parameter_definition_id"),
  key: text("key").notNull(),
  dataType: parameterDataTypeEnum("data_type").notNull().default("NUMBER"),
  valueNumber: doublePrecision("value_number"),
  valueBoolean: boolean("value_boolean"),
  valueText: text("value_text"),
  valueEnum: text("value_enum"),
});

export const presetFiles = pgTable("preset_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  toneId: uuid("tone_id")
    .notNull()
    .references(() => tones.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  platform: text("platform"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const toneScreenshots = pgTable("tone_screenshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  toneId: uuid("tone_id")
    .notNull()
    .references(() => tones.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const audioDemos = pgTable("audio_demos", {
  id: uuid("id").defaultRandom().primaryKey(),
  toneId: uuid("tone_id")
    .notNull()
    .references(() => tones.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  durationMs: integer("duration_ms"),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const toneTags = pgTable(
  "tone_tags",
  {
    toneId: uuid("tone_id")
      .notNull()
      .references(() => tones.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("tone_tags_pk").on(t.toneId, t.tagId)],
);
