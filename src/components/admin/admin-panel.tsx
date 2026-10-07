"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createArtistAction,
  createSongAction,
  setUserRoleAction,
  updateReportStatusAction,
  verifyEquipmentAction,
} from "@/features/admin/actions";

export function AdminPanel(props: {
  users: Array<{ id: string; name: string; email: string; role: string }>;
  artists: Array<{ id: string; name: string; slug: string }>;
  songs: Array<{ id: string; title: string; artistName: string; artistId: string }>;
  reports: Array<{
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
  }>;
  equipment: Array<{ id: string; name: string; category: string; isVerified: boolean }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="font-heading text-xl">Users</h2>
        <ul className="mt-3 divide-y divide-border/50 text-sm">
          {props.users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-2 py-2">
              <span>
                {u.name} · {u.email} · {u.role}
              </span>
              {u.role !== "admin" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    await setUserRoleAction(u.id, "admin");
                    setBusy(false);
                    router.refresh();
                  }}
                >
                  Make admin
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl">Add artist</h2>
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            await createArtistAction({
              name: String(fd.get("name")),
              description: String(fd.get("description") || ""),
            });
            toast.success("Artist created");
            setBusy(false);
            router.refresh();
          }}
        >
          <Input name="name" placeholder="Artist name" required />
          <Input name="description" placeholder="Description" />
          <Button type="submit" disabled={busy}>
            Create artist
          </Button>
        </form>
        <h3 className="font-heading text-lg">Add song</h3>
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            await createSongAction({
              artistId: String(fd.get("artistId")),
              title: String(fd.get("title")),
              album: String(fd.get("album") || ""),
            });
            toast.success("Song created");
            setBusy(false);
            router.refresh();
          }}
        >
          <select
            name="artistId"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {props.artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <Input name="title" placeholder="Song title" required />
          <Input name="album" placeholder="Album" />
          <Button type="submit" disabled={busy}>
            Create song
          </Button>
        </form>
      </section>

      <section>
        <h2 className="font-heading text-xl">Equipment</h2>
        <ul className="mt-3 max-h-80 space-y-2 overflow-auto text-sm">
          {props.equipment.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2">
              <span>
                {e.name} ({e.category}) {e.isVerified ? "✓" : ""}
              </span>
              {!e.isVerified && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    await verifyEquipmentAction(e.id);
                    setBusy(false);
                    router.refresh();
                  }}
                >
                  Verify
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl">Reports</h2>
        {props.reports.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No reports.</p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {props.reports.map((r) => (
              <li key={r.id} className="border border-border/50 p-3">
                <p>
                  {r.targetType} · {r.status}
                </p>
                <p className="text-muted-foreground">{r.reason}</p>
                <div className="mt-2 flex gap-2">
                  {(["REVIEWING", "RESOLVED", "DISMISSED"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        await updateReportStatusAction({ id: r.id, status });
                        setBusy(false);
                        router.refresh();
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="lg:col-span-2">
        <h2 className="font-heading text-xl">Catalog snapshot</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {props.artists.length} artists · {props.songs.length} songs listed in admin view.
        </p>
        <Label className="sr-only">Songs</Label>
        <ul className="mt-3 columns-1 gap-4 text-sm sm:columns-2">
          {props.songs.map((s) => (
            <li key={s.id} className="mb-1">
              {s.artistName} — {s.title}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
