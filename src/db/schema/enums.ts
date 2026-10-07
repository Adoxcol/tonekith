import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const equipmentCategoryEnum = pgEnum("equipment_category", [
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
]);

export const toneTypeEnum = pgEnum("tone_type", [
  "STUDIO",
  "LIVE",
  "RECREATION",
  "INSPIRED_BY",
  "COVER",
  "CUSTOM",
]);

export const songSectionEnum = pgEnum("song_section", [
  "FULL_SONG",
  "INTRO",
  "VERSE",
  "CHORUS",
  "BRIDGE",
  "RHYTHM",
  "LEAD",
  "SOLO",
  "OUTRO",
  "OTHER",
]);

export const toneStatusEnum = pgEnum("tone_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const toneVisibilityEnum = pgEnum("tone_visibility", [
  "PUBLIC",
  "UNLISTED",
  "PRIVATE",
]);

export const parameterDataTypeEnum = pgEnum("parameter_data_type", [
  "NUMBER",
  "BOOLEAN",
  "ENUM",
  "TEXT",
]);

export const chainItemTypeEnum = pgEnum("chain_item_type", [
  "GUITAR",
  "AMP",
  "PEDAL",
  "PLUGIN",
  "CABINET",
  "MIC",
  "OTHER",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
]);

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "TONE",
  "COMMENT",
  "USER",
  "EQUIPMENT",
]);
