import { ToneCard } from "@/components/tones/tone-card";
import { getPublishedTones } from "@/features/tones/queries";

export default async function TonesPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const rows = await getPublishedTones({
    limit: 40,
    platform: sp.platform,
    sort: (sp.sort as "newest" | "top" | "tried" | "saved") || "top",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl tracking-tight">Tones</h1>
      <p className="mt-2 text-muted-foreground">
        Published community recipes{sp.platform ? ` · ${sp.platform}` : ""}.
      </p>
      <div className="mt-8">
        {rows.map((row) => (
          <ToneCard
            key={row.tone.id}
            id={row.tone.id}
            title={row.tone.title}
            artistName={row.artist.name}
            songTitle={row.song.title}
            platform={row.tone.platform}
            avgRating={row.tone.avgRating}
            toneType={row.tone.toneType}
            creatorName={row.creatorName}
          />
        ))}
      </div>
    </div>
  );
}
