import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ToneCard } from "@/components/tones/tone-card";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db/client";
import { artists, songs } from "@/db/schema";
import { getPublishedTones } from "@/features/tones/queries";
import { cn } from "@/lib/utils";

export default async function SongDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ artistSlug: string; songSlug: string }>;
  searchParams: Promise<{ sort?: string; platform?: string; type?: string }>;
}) {
  const { artistSlug, songSlug } = await params;
  const sp = await searchParams;

  const [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.slug, artistSlug))
    .limit(1);
  if (!artist) notFound();

  const [song] = await db
    .select()
    .from(songs)
    .where(and(eq(songs.artistId, artist.id), eq(songs.slug, songSlug)))
    .limit(1);
  if (!song) notFound();

  const toneRows = await getPublishedTones({
    songId: song.id,
    sort: (sp.sort as "newest" | "top" | "tried" | "saved") || "top",
    platform: sp.platform,
    toneType: sp.type,
    limit: 50,
  });

  const sortLink = (sort: string, label: string) => (
    <Link
      href={`?sort=${sort}${sp.platform ? `&platform=${sp.platform}` : ""}`}
      className={cn(
        "text-sm",
        (sp.sort || "top") === sort ? "text-[var(--brand-orange)]" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        <Link href={`/artists/${artist.slug}`} className="hover:text-foreground">
          {artist.name}
        </Link>{" "}
        / {song.title}
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl tracking-tight">{song.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {artist.name}
            {song.album ? ` · ${song.album}` : ""}
            {song.releaseYear ? ` · ${song.releaseYear}` : ""}
            {song.defaultTuning ? ` · ${song.defaultTuning}` : ""}
          </p>
        </div>
        <Link
          href={`/tones/new?songId=${song.id}`}
          className={cn(buttonVariants())}
        >
          Add a tone
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4 border-b border-border/50 pb-4">
        {sortLink("top", "Top rated")}
        {sortLink("newest", "Newest")}
        {sortLink("tried", "Most tried")}
        {sortLink("saved", "Most saved")}
        <span className="text-border">|</span>
        <Link
          href="?platform=Physical"
          className={cn("text-sm", sp.platform === "Physical" ? "text-[var(--brand-orange)]" : "text-muted-foreground")}
        >
          Physical
        </Link>
        <Link
          href="?platform=Neural%20DSP"
          className={cn("text-sm", sp.platform === "Neural DSP" ? "text-[var(--brand-orange)]" : "text-muted-foreground")}
        >
          Neural DSP
        </Link>
        <Link
          href="?platform=AmpliTube"
          className={cn("text-sm", sp.platform === "AmpliTube" ? "text-[var(--brand-orange)]" : "text-muted-foreground")}
        >
          AmpliTube
        </Link>
      </div>

      <div className="mt-2">
        {toneRows.length === 0 ? (
          <p className="py-12 text-muted-foreground">
            No published tones yet. Be the first to share a recipe.
          </p>
        ) : (
          toneRows.map((row) => (
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
          ))
        )}
      </div>
    </div>
  );
}
