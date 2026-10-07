import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ToneCard } from "@/components/tones/tone-card";
import { ProfileEditor } from "@/components/profiles/profile-editor";
import { db } from "@/db/client";
import { artists, favorites, profiles, songs, tones } from "@/db/schema";
import { getGearForUser } from "@/features/gear/actions";
import { getSession } from "@/server/session";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, id)).limit(1);
  if (!profile) notFound();

  const session = await getSession();
  const isOwner = session?.user?.id === id;

  const [published, forked, saved, gear] = await Promise.all([
    db
      .select({ tone: tones, song: songs, artist: artists })
      .from(tones)
      .innerJoin(songs, eq(tones.songId, songs.id))
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .where(
        and(eq(tones.creatorId, id), eq(tones.status, "PUBLISHED"), eq(tones.visibility, "PUBLIC")),
      ),
    db
      .select({ tone: tones, song: songs, artist: artists })
      .from(tones)
      .innerJoin(songs, eq(tones.songId, songs.id))
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .where(and(eq(tones.creatorId, id), eq(tones.status, "PUBLISHED")))
      .then((rows) => rows.filter((r) => r.tone.forkedFromToneId)),
    db
      .select({ tone: tones, song: songs, artist: artists })
      .from(favorites)
      .innerJoin(tones, eq(favorites.toneId, tones.id))
      .innerJoin(songs, eq(tones.songId, songs.id))
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .where(eq(favorites.userId, id)),
    getGearForUser(id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-4xl tracking-tight">{profile.displayName}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{profile.bio || "No bio yet."}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>{published.length} published</span>
        <span>{forked.length} forks</span>
        <span>{saved.length} saved</span>
        <span>{gear.length} gear items</span>
      </div>

      {isOwner && (
        <div className="mt-8">
          <ProfileEditor
            initial={{
              displayName: profile.displayName,
              bio: profile.bio ?? "",
              location: profile.location ?? "",
              website: profile.website ?? "",
              allowDatasetUse: profile.allowDatasetUse,
              allowAudioTrainingUse: profile.allowAudioTrainingUse,
            }}
          />
        </div>
      )}

      <section className="mt-12">
        <h2 className="font-heading text-xl">Published tones</h2>
        <div className="mt-4">
          {published.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published tones.</p>
          ) : (
            published.map((row) => (
              <ToneCard
                key={row.tone.id}
                id={row.tone.id}
                title={row.tone.title}
                artistName={row.artist.name}
                songTitle={row.song.title}
                platform={row.tone.platform}
                avgRating={row.tone.avgRating}
                toneType={row.tone.toneType}
                creatorName={profile.displayName}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-xl">Gear</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {gear.map((g) => (
            <li key={g.gear.id}>
              {g.manufacturer.name} {g.model.name}{" "}
              <span className="text-muted-foreground">({g.model.category})</span>
            </li>
          ))}
          {gear.length === 0 && (
            <li className="text-muted-foreground">
              No gear listed.{" "}
              {isOwner && (
                <Link href="/gear" className="text-amber-300 hover:underline">
                  Add gear
                </Link>
              )}
            </li>
          )}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-xl">Saved tones</h2>
        <div className="mt-4">
          {saved.map((row) => (
            <ToneCard
              key={row.tone.id}
              id={row.tone.id}
              title={row.tone.title}
              artistName={row.artist.name}
              songTitle={row.song.title}
              platform={row.tone.platform}
              avgRating={row.tone.avgRating}
              toneType={row.tone.toneType}
              creatorName="Saved"
            />
          ))}
          {saved.length === 0 && (
            <p className="text-sm text-muted-foreground">No saved tones yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
