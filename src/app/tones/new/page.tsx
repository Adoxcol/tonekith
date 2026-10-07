import { redirect } from "next/navigation";
import { ToneEditor } from "@/components/tones/tone-editor";
import { db } from "@/db/client";
import { artists, equipmentModels, songs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/server/session";

export default async function NewTonePage({
  searchParams,
}: {
  searchParams: Promise<{ songId?: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");
  const { songId } = await searchParams;

  const songRows = await db
    .select({ song: songs, artist: artists })
    .from(songs)
    .innerJoin(artists, eq(songs.artistId, artists.id));

  const gear = await db.select().from(equipmentModels);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-3xl tracking-tight">Create tone recipe</h1>
      <p className="mt-2 text-muted-foreground">
        Multi-step draft — song, info, gear, chain, notes, then publish.
      </p>
      <div className="mt-8">
        <ToneEditor
          mode="create"
          songs={songRows.map((r) => ({
            id: r.song.id,
            label: `${r.artist.name} — ${r.song.title}`,
          }))}
          equipment={gear.map((g) => ({
            id: g.id,
            label: g.name,
            category: g.category,
          }))}
          initialSongId={songId}
        />
      </div>
    </div>
  );
}
