import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioPlayer } from "@/components/tones/audio-player";
import { SignalChainView } from "@/components/tones/signal-chain-view";
import { ToneActions } from "@/components/tones/tone-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getToneDetail, getUserToneInteraction } from "@/features/tones/queries";
import { trackEvent } from "@/lib/analytics";
import { getStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { getSession } from "@/server/session";

export default async function ToneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getToneDetail(id);
  if (!detail) notFound();

  const session = await getSession();
  const isOwner = session?.user?.id === detail.tone.creatorId;
  const canView =
    detail.tone.status === "PUBLISHED" ||
    isOwner ||
    (session?.user as { role?: string } | undefined)?.role === "admin";
  if (!canView) notFound();

  await trackEvent({
    eventType: "tone_viewed",
    userId: session?.user?.id,
    toneId: detail.tone.id,
  });

  const interaction = session?.user
    ? await getUserToneInteraction(session.user.id, detail.tone.id)
    : { favorited: false, rating: null, tried: false };

  const storage = getStorage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        <Link href={`/artists/${detail.artist.slug}`} className="hover:text-foreground">
          {detail.artist.name}
        </Link>{" "}
        /{" "}
        <Link
          href={`/songs/${detail.artist.slug}/${detail.song.slug}`}
          className="hover:text-foreground"
        >
          {detail.song.title}
        </Link>{" "}
        / {detail.tone.title}
      </p>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl tracking-tight">{detail.tone.title}</h1>
          <p className="mt-2 text-muted-foreground">
            by{" "}
            <Link href={`/u/${detail.creator.userId}`} className="text-[var(--brand-orange)] hover:underline">
              {detail.creator.displayName}
            </Link>
            {" · "}
            {(detail.tone.avgRating ?? 0).toFixed(1)}★ · {detail.tone.ratingCount} ratings ·{" "}
            {detail.tone.tryCount} tries · {detail.tone.favoriteCount} saves
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{detail.tone.toneType.replaceAll("_", " ")}</Badge>
            <Badge variant="outline">{detail.tone.songSection.replaceAll("_", " ")}</Badge>
            {detail.tone.platform && <Badge variant="secondary">{detail.tone.platform}</Badge>}
            <Badge variant="outline">{detail.tone.status}</Badge>
          </div>
        </div>
        {isOwner && (
          <Link href={`/tones/${detail.tone.id}/edit`} className={cn(buttonVariants({ variant: "outline" }))}>
            Edit
          </Link>
        )}
      </div>

      {detail.forkedFrom && (
        <p className="mt-4 text-sm text-muted-foreground">
          Forked from{" "}
          <Link href={`/tones/${detail.forkedFrom.id}`} className="text-[var(--brand-orange)] hover:underline">
            {detail.forkedFrom.title}
          </Link>
        </p>
      )}

      <p className="mt-6 max-w-3xl text-foreground/90">{detail.tone.description}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="font-heading text-xl">Signal chain</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ordered path from guitar to output.</p>
            <div className="mt-4">
              <SignalChainView items={detail.items} />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl">Notes</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">
              {detail.tone.notes || "No notes yet."}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl">Audio demos</h2>
            <div className="mt-4 space-y-4">
              {detail.audios.length === 0 ? (
                <p className="text-sm text-muted-foreground">No audio uploaded.</p>
              ) : (
                detail.audios.map((a) => (
                  <AudioPlayer
                    key={a.id}
                    src={storage.getUrl(a.storageKey)}
                    toneId={detail.tone.id}
                    fileName={a.fileName}
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl">Screenshots</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {detail.screenshots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No screenshots.</p>
              ) : (
                detail.screenshots.map((s) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={s.id}
                    src={storage.getUrl(s.storageKey)}
                    alt={s.caption || "Tone screenshot"}
                    className="border border-border/50"
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl">Presets</h2>
            <ul className="mt-3 space-y-2">
              {detail.presets.length === 0 ? (
                <li className="text-sm text-muted-foreground">No preset files.</li>
              ) : (
                detail.presets.map((p) => (
                  <li key={p.id}>
                    <a
                      href={`/api/presets/${p.id}/download`}
                      className="text-sm text-[var(--brand-orange)] hover:underline"
                    >
                      {p.fileName}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl">Comments</h2>
            <ul className="mt-4 space-y-4">
              {detail.comments.length === 0 ? (
                <li className="text-sm text-muted-foreground">No comments yet.</li>
              ) : (
                detail.comments.map(({ comment, author }) => (
                  <li key={comment.id} className="border-b border-border/40 pb-3">
                    <p className="text-sm font-medium">{author.displayName}</p>
                    <p className="mt-1 text-sm text-foreground/90">{comment.body}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="border border-border/50 p-4">
            <h2 className="font-heading text-lg">Setup</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Tuning</dt>
                <dd>{detail.tone.tuning}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Capo</dt>
                <dd>{detail.tone.capo ?? 0}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">BPM</dt>
                <dd>{detail.tone.bpm ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Difficulty</dt>
                <dd>{detail.tone.difficulty ?? "—"}/5</dd>
              </div>
            </dl>
            <Separator className="my-4" />
            <ToneActions
              toneId={detail.tone.id}
              favorited={interaction.favorited}
              tried={interaction.tried}
              isAuthed={!!session?.user}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
