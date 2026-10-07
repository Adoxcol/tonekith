import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { eq } from "drizzle-orm";
import { TonekithWordmark } from "@/components/brand/wordmark";
import { ToneCard } from "@/components/tones/tone-card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db/client";
import { artists, equipmentModels, songs } from "@/db/schema";
import { getPublishedTones } from "@/features/tones/queries";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [trending, recent, popularSongs, ampSims] = await Promise.all([
    getPublishedTones({ limit: 6, sort: "top" }),
    getPublishedTones({ limit: 6, sort: "newest" }),
    db
      .select({ song: songs, artist: artists })
      .from(songs)
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .limit(6),
    db
      .select()
      .from(equipmentModels)
      .where(eq(equipmentModels.category, "AMP_SIM"))
      .limit(6),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/50">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgb(255_122_0/0.12),transparent_42%),radial-gradient(circle_at_85%_0%,rgb(35_35_39/0.8),transparent_40%)]"
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-center px-4 py-16">
          <TonekithWordmark
            className="animate-rise text-5xl sm:text-7xl md:text-8xl"
            knobClassName="h-[0.88em] w-[0.88em] animate-knob"
          />
          <h1 className="animate-rise-delay mt-5 max-w-xl font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Find your tone. Make it yours.
          </h1>
          <p className="animate-rise-delay mt-3 max-w-lg text-muted-foreground">
            Search a song, open a recipe, and recreate the chain — amp, pedals, params, presets, and
            audio demos from the community.
          </p>
          <form action="/search" className="animate-rise-delay mt-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                name="q"
                placeholder="Try “Apocalypse” or “Cigarettes After Sex”"
                className="h-11 border-border/70 bg-card/80 pl-10"
                aria-label="Search tones, songs, artists"
              />
            </div>
            <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
              Search
            </button>
          </form>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/songs/cigarettes-after-sex/apocalypse" className={cn(buttonVariants())}>
              Open Apocalypse tones
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/tones/new" className={cn(buttonVariants({ variant: "outline" }))}>
              Create a tone
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-2">
        <section>
          <h2 className="font-heading text-xl font-semibold tracking-tight">Top rated</h2>
          <p className="mt-1 text-sm text-muted-foreground">Community favorites by accuracy.</p>
          <div className="mt-4">
            {trending.map((row) => (
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
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold tracking-tight">Recently published</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fresh recipes from the shop floor.</p>
          <div className="mt-4">
            {recent.map((row) => (
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
        </section>
      </div>

      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-heading text-xl font-semibold tracking-tight">Popular songs</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularSongs.map(({ song, artist }) => (
              <li key={song.id}>
                <Link
                  href={`/songs/${artist.slug}/${song.slug}`}
                  className="block border border-border/60 bg-card/40 px-4 py-3 transition hover:border-[var(--brand-orange)]/45 hover:bg-card"
                >
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{artist.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-heading text-xl font-semibold tracking-tight">Browse by amp sim</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {ampSims.map((m) => (
              <Link
                key={m.id}
                href={`/tones?platform=${encodeURIComponent(m.name.includes("AmpliTube") ? "AmpliTube" : "Neural DSP")}`}
                className="border border-border/60 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-[var(--brand-orange)]/50 hover:text-foreground"
              >
                {m.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
