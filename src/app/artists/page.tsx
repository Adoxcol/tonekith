import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { artists } from "@/db/schema";

export default async function ArtistsPage() {
  const rows = await db.select().from(artists).orderBy(asc(artists.name));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl tracking-tight">Artists</h1>
      <p className="mt-2 text-muted-foreground">Browse songs and community tones by artist.</p>
      <ul className="mt-8 divide-y divide-border/50">
        {rows.map((a) => (
          <li key={a.id}>
            <Link
              href={`/artists/${a.slug}`}
              className="flex items-start justify-between gap-4 py-4 transition hover:bg-white/[0.02]"
            >
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{a.description}</p>
              </div>
              <span className="text-sm text-amber-300/80">View →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
