import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { artists, songs } from "@/db/schema";

export default async function SongsPage() {
  const rows = await db
    .select({ song: songs, artist: artists })
    .from(songs)
    .innerJoin(artists, eq(songs.artistId, artists.id))
    .orderBy(asc(artists.name), asc(songs.title));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl tracking-tight">Songs</h1>
      <p className="mt-2 text-muted-foreground">Open a song to see every community tone recipe.</p>
      <ul className="mt-8 divide-y divide-border/50">
        {rows.map(({ song, artist }) => (
          <li key={song.id}>
            <Link
              href={`/songs/${artist.slug}/${song.slug}`}
              className="flex items-center justify-between gap-4 py-4 hover:bg-white/[0.02]"
            >
              <div>
                <p className="font-medium">{song.title}</p>
                <p className="text-sm text-muted-foreground">{artist.name}</p>
              </div>
              <span className="text-sm text-amber-300/80">View tones →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
