import { z } from "zod";

export const toneTypeSchema = z.enum([
  "STUDIO",
  "LIVE",
  "RECREATION",
  "INSPIRED_BY",
  "COVER",
  "CUSTOM",
]);

export const songSectionSchema = z.enum([
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

export const toneStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const toneVisibilitySchema = z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]);

export const createToneSchema = z.object({
  songId: z.string().uuid(),
  title: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  toneType: toneTypeSchema.default("RECREATION"),
  songSection: songSectionSchema.default("FULL_SONG"),
  visibility: toneVisibilitySchema.default("PUBLIC"),
  difficulty: z.number().int().min(1).max(5).optional().nullable(),
  tuning: z.string().max(32).optional(),
  capo: z.number().int().min(0).max(12).optional(),
  bpm: z.number().int().min(20).max(300).optional().nullable(),
  notes: z.string().max(10000).optional(),
  platform: z.string().max(80).optional(),
  guitarEquipmentId: z.string().uuid().optional().nullable(),
  ampEquipmentId: z.string().uuid().optional().nullable(),
});

export const updateToneSchema = createToneSchema.partial().extend({
  id: z.string().uuid(),
});

export const chainItemSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(120),
  itemType: z.enum(["GUITAR", "AMP", "PEDAL", "PLUGIN", "CABINET", "MIC", "OTHER"]),
  equipmentModelId: z.string().uuid().optional().nullable(),
  isEnabled: z.boolean().default(true),
  isSoftware: z.boolean().default(false),
  notes: z.string().max(2000).optional().nullable(),
  parameters: z
    .array(
      z.object({
        key: z.string().min(1),
        dataType: z.enum(["NUMBER", "BOOLEAN", "ENUM", "TEXT"]).default("NUMBER"),
        valueNumber: z.number().optional().nullable(),
        valueBoolean: z.boolean().optional().nullable(),
        valueText: z.string().optional().nullable(),
        valueEnum: z.string().optional().nullable(),
      }),
    )
    .default([]),
});

export const saveChainSchema = z.object({
  toneId: z.string().uuid(),
  items: z.array(chainItemSchema),
});

export const ratingSchema = z.object({
  toneId: z.string().uuid(),
  overall: z.number().int().min(1).max(5),
  accuracy: z.number().int().min(1).max(5),
  soundQuality: z.number().int().min(1).max(5),
  usefulness: z.number().int().min(1).max(5),
});

export const feedbackSchema = z.object({
  toneId: z.string().uuid(),
  tags: z.array(z.string()).min(1),
  comment: z.string().max(2000).optional(),
});

export const commentSchema = z.object({
  toneId: z.string().uuid(),
  body: z.string().min(1).max(4000),
  parentId: z.string().uuid().optional().nullable(),
});

export const FEEDBACK_TAGS = [
  "TOO_BRIGHT",
  "TOO_DARK",
  "TOO_MUCH_GAIN",
  "TOO_LITTLE_GAIN",
  "TOO_MUCH_BASS",
  "TOO_LITTLE_BASS",
  "TOO_COMPRESSED",
  "TOO_DRY",
  "TOO_WET",
  "NOT_CLOSE",
  "VERY_CLOSE",
] as const;
