import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToneCard } from "@/components/tones/tone-card";
import { trackEvent } from "@/lib/analytics";
import { searchAll } from "@/features/tones/queries";
import { getSession } from "@/server/session";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const session = await getSession();
  const results = q.trim() ? await searchAll(q.trim(), 12) : null;

  if (q.trim()) {
    await trackEvent({
      eventType: "search_performed",
      userId: session?.user?.id,
      payload: { q },
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl tracking-tight">Search</h1>
      <form className="relative mt-6 max-w-xl">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Artists, songs, tones, users…"
          className="h-11 pl-10"
          aria-label="Search query"
        />
      </form>

      {!q.trim() && (
        <p className="mt-10 text-muted-foreground">
          Try <Link href="/search?q=Apocalypse" className="text-[var(--brand-orange)] hover:underline">Apocalypse</Link>,{" "}
          <Link href="/search?q=Blackstar" className="text-[var(--brand-orange)] hover:underline">Blackstar</Link>, or{" "}
          <Link href="/search?q=Deftones" className="text-[var(--brand-orange)] hover:underline">Deftones</Link>.
        </p>
      )}

      {results && (
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="font-heading text-lg">Tones</h2>
            {results.tones.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No tones matched.</p>
            ) : (
              results.tones.map((row) => (
                <ToneCard
                  key={row.tone.id}
                  id={row.tone.id}
                  title={row.tone.title}
                  artistName={row.artist.name}
                  songTitle={row.song.title}
                  platform={row.tone.platform}
                  avgRating={row.tone.avgRating}
                  toneType={row.tone.toneType}
                  creatorName="Community"
                />
              ))
            )}
          </section>
          <div className="space-y-8">
            <section>
              <h2 className="font-heading text-lg">Songs</h2>
              <ul className="mt-3 space-y-2">
                {results.songs.map(({ song, artist }) => (
                  <li key={song.id}>
                    <Link
                      href={`/songs/${artist.slug}/${song.slug}`}
                      className="text-sm hover:text-[var(--brand-orange)]"
                    >
                      {artist.name} — {song.title}
                    </Link>
                  </li>
                ))}
                {results.songs.length === 0 && (
                  <li className="text-sm text-muted-foreground">No songs matched.</li>
                )}
              </ul>
            </section>
            <section>
              <h2 className="font-heading text-lg">Artists</h2>
              <ul className="mt-3 space-y-2">
                {results.artists.map((a) => (
                  <li key={a.id}>
                    <Link href={`/artists/${a.slug}`} className="text-sm hover:text-[var(--brand-orange)]">
                      {a.name}
                    </Link>
                  </li>
                ))}
                {results.artists.length === 0 && (
                  <li className="text-sm text-muted-foreground">No artists matched.</li>
                )}
              </ul>
            </section>
            <section>
              <h2 className="font-heading text-lg">Users</h2>
              <ul className="mt-3 space-y-2">
                {results.users.map(({ profile }) => (
                  <li key={profile.userId}>
                    <Link
                      href={`/u/${profile.userId}`}
                      className="text-sm hover:text-[var(--brand-orange)]"
                    >
                      {profile.displayName}
                    </Link>
                  </li>
                ))}
                {results.users.length === 0 && (
                  <li className="text-sm text-muted-foreground">No users matched.</li>
                )}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
