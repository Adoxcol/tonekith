import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { equipmentCategoryEnum, parameterDataTypeEnum } from "./enums";

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarKey: text("avatar_key"),
  location: text("location"),
  website: text("website"),
  allowDatasetUse: boolean("allow_dataset_use").notNull().default(true),
  allowAudioTrainingUse: boolean("allow_audio_training_use").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const artists = pgTable("artists", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageKey: text("image_key"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const songs = pgTable(
  "songs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    album: text("album"),
    releaseYear: integer("release_year"),
    artworkKey: text("artwork_key"),
    defaultTuning: text("default_tuning").default("EADGBE"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("songs_artist_slug_idx").on(t.artistId, t.slug)],
);

export const equipmentManufacturers = pgTable("equipment_manufacturers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  normalizedName: text("normalized_name").notNull().unique(),
  website: text("website"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const equipmentModels = pgTable(
  "equipment_models",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    manufacturerId: uuid("manufacturer_id")
      .notNull()
      .references(() => equipmentManufacturers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    category: equipmentCategoryEnum("category").notNull(),
    description: text("description"),
    isVerified: boolean("is_verified").notNull().default(false),
    submittedByUserId: text("submitted_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("equipment_models_unique_idx").on(
      t.manufacturerId,
      t.category,
      t.normalizedName,
    ),
  ],
);

export const effectModels = pgTable("effect_models", {
  id: uuid("id").defaultRandom().primaryKey(),
  equipmentModelId: uuid("equipment_model_id").references(() => equipmentModels.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  category: text("category"),
  defaultParams: jsonb("default_params").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const parameterDefinitions = pgTable("parameter_definitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  equipmentModelId: uuid("equipment_model_id").references(() => equipmentModels.id, {
    onDelete: "cascade",
  }),
  effectModelId: uuid("effect_model_id").references(() => effectModels.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  key: text("key").notNull(),
  dataType: parameterDataTypeEnum("data_type").notNull(),
  unit: text("unit"),
  min: integer("min"),
  max: integer("max"),
  step: integer("step"),
  options: jsonb("options").$type<string[]>(),
  displayOrder: integer("display_order").notNull().default(0),
  defaultValue: text("default_value"),
});

export const userGear = pgTable("user_gear", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  equipmentModelId: uuid("equipment_model_id")
    .notNull()
    .references(() => equipmentModels.id, { onDelete: "cascade" }),
  nickname: text("nickname"),
  notes: text("notes"),
  isPrimary: boolean("is_primary").notNull().default(false),
  acquiredYear: integer("acquired_year"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});
