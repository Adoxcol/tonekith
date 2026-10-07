import { db } from "@/db/client";
import { analyticsEvents } from "@/db/schema";

export type AnalyticsEventType =
  | "tone_viewed"
  | "tone_saved"
  | "tone_tried"
  | "tone_rated"
  | "tone_forked"
  | "tone_published"
  | "preset_downloaded"
  | "audio_played"
  | "search_performed";

export async function trackEvent(input: {
  eventType: AnalyticsEventType;
  userId?: string | null;
  toneId?: string | null;
  payload?: Record<string, unknown>;
}) {
  try {
    await db.insert(analyticsEvents).values({
      eventType: input.eventType,
      userId: input.userId ?? null,
      toneId: input.toneId ?? null,
      payload: input.payload ?? {},
    });
  } catch {
    // analytics must never break UX
  }
}
