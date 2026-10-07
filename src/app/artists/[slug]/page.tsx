import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { artists, songs } from "@/db/schema";

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [artist] = await db.select().from(artists).where(eq(artists.slug, slug)).limit(1);
  if (!artist) notFound();

  const songRows = await db
    .select()
    .from(songs)
    .where(eq(songs.artistId, artist.id))
    .orderBy(asc(songs.title));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        <Link href="/artists" className="hover:text-foreground">
          Artists
        </Link>{" "}
        / {artist.name}
      </p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">{artist.name}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{artist.description}</p>
      <h2 className="mt-10 font-heading text-xl">Songs</h2>
      <ul className="mt-4 divide-y divide-border/50">
        {songRows.map((s) => (
          <li key={s.id}>
            <Link
              href={`/songs/${artist.slug}/${s.slug}`}
              className="flex items-center justify-between py-3 hover:text-[var(--brand-orange)]"
            >
              <span>
                {s.title}
                {s.album ? (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {s.album}
                    {s.releaseYear ? ` · ${s.releaseYear}` : ""}
                  </span>
                ) : null}
              </span>
              <span className="text-sm text-muted-foreground">Tones →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
