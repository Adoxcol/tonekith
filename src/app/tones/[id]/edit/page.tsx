import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ToneEditor } from "@/components/tones/tone-editor";
import { MediaUploader } from "@/components/tones/media-uploader";
import { db } from "@/db/client";
import { artists, equipmentModels, songs, tones } from "@/db/schema";
import { getToneDetail } from "@/features/tones/queries";
import { getSession } from "@/server/session";

export default async function EditTonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");
  const { id } = await params;
  const [tone] = await db.select().from(tones).where(eq(tones.id, id)).limit(1);
  if (!tone) notFound();
  if (tone.creatorId !== session.user.id) redirect(`/tones/${id}`);

  const detail = await getToneDetail(id);
  if (!detail) notFound();

  const songRows = await db
    .select({ song: songs, artist: artists })
    .from(songs)
    .innerJoin(artists, eq(songs.artistId, artists.id));
  const gear = await db.select().from(equipmentModels);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-3xl tracking-tight">Edit tone</h1>
      <p className="mt-2 text-muted-foreground">{tone.title}</p>
      <div className="mt-8 space-y-12">
        <ToneEditor
          mode="edit"
          toneId={tone.id}
          songs={songRows.map((r) => ({
            id: r.song.id,
            label: `${r.artist.name} — ${r.song.title}`,
          }))}
          equipment={gear.map((g) => ({
            id: g.id,
            label: g.name,
            category: g.category,
          }))}
          initial={{
            songId: tone.songId,
            title: tone.title,
            description: tone.description ?? "",
            toneType: tone.toneType,
            songSection: tone.songSection,
            visibility: tone.visibility,
            platform: tone.platform ?? "",
            tuning: tone.tuning ?? "EADGBE",
            capo: tone.capo ?? 0,
            bpm: tone.bpm ?? undefined,
            notes: tone.notes ?? "",
            guitarEquipmentId: tone.guitarEquipmentId,
            ampEquipmentId: tone.ampEquipmentId,
            status: tone.status,
            chain: detail.items.map(({ item, parameters }) => ({
              label: item.label,
              itemType: item.itemType,
              equipmentModelId: item.equipmentModelId,
              isEnabled: item.isEnabled,
              isSoftware: item.isSoftware,
              parameters: parameters.map((p) => ({
                key: p.key,
                dataType: p.dataType,
                valueNumber: p.valueNumber,
                valueBoolean: p.valueBoolean,
                valueText: p.valueText,
                valueEnum: p.valueEnum,
              })),
            })),
          }}
        />
        <MediaUploader toneId={tone.id} />
      </div>
    </div>
  );
}
