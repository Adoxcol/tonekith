import { NextResponse } from "next/server";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics";
import { getSession } from "@/server/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.eventType) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const session = await getSession();
  await trackEvent({
    eventType: body.eventType as AnalyticsEventType,
    userId: session?.user?.id,
    toneId: body.toneId,
    payload: body.payload,
  });
  return NextResponse.json({ ok: true });
}
