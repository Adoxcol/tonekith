import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { reportStatusEnum, reportTargetTypeEnum } from "./enums";
import { tones } from "./tones";

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toneId: uuid("tone_id")
      .notNull()
      .references(() => tones.id, { onDelete: "cascade" }),
    overall: integer("overall").notNull(),
    accuracy: integer("accuracy").notNull(),
    soundQuality: integer("sound_quality").notNull(),
    usefulness: integer("usefulness").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("ratings_user_tone_idx").on(t.userId, t.toneId)],
);

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toneId: uuid("tone_id")
      .notNull()
      .references(() => tones.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("favorites_user_tone_idx").on(t.userId, t.toneId)],
);

export const toneTries = pgTable(
  "tone_tries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toneId: uuid("tone_id")
      .notNull()
      .references(() => tones.id, { onDelete: "cascade" }),
    triedAt: timestamp("tried_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tone_tries_user_tone_idx").on(t.userId, t.toneId)],
);

export const toneFeedback = pgTable("tone_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  toneId: uuid("tone_id")
    .notNull()
    .references(() => tones.id, { onDelete: "cascade" }),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  toneId: uuid("tone_id")
    .notNull()
    .references(() => tones.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: reportTargetTypeEnum("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").notNull().default("OPEN"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  toneId: uuid("tone_id").references(() => tones.id, { onDelete: "set null" }),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
