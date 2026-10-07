import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { AdminPanel } from "@/components/admin/admin-panel";
import { db } from "@/db/client";
import {
  artists,
  equipmentManufacturers,
  equipmentModels,
  reports,
  songs,
  users,
} from "@/db/schema";
import { getSession } from "@/server/session";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/");
  }

  const [userRows, artistRows, songRows, reportRows, equipRows] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)).limit(50),
    db.select().from(artists).limit(50),
    db
      .select({ song: songs, artist: artists })
      .from(songs)
      .innerJoin(artists, eq(songs.artistId, artists.id))
      .limit(50),
    db.select().from(reports).orderBy(desc(reports.createdAt)).limit(50),
    db
      .select({
        model: equipmentModels,
        manufacturer: equipmentManufacturers,
      })
      .from(equipmentModels)
      .innerJoin(
        equipmentManufacturers,
        eq(equipmentModels.manufacturerId, equipmentManufacturers.id),
      )
      .limit(80),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl tracking-tight">Admin</h1>
      <p className="mt-2 text-muted-foreground">Users, catalog, equipment verification, reports.</p>
      <div className="mt-8">
        <AdminPanel
          users={userRows.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
          }))}
          artists={artistRows.map((a) => ({ id: a.id, name: a.name, slug: a.slug }))}
          songs={songRows.map((r) => ({
            id: r.song.id,
            title: r.song.title,
            artistName: r.artist.name,
            artistId: r.artist.id,
          }))}
          reports={reportRows.map((r) => ({
            id: r.id,
            targetType: r.targetType,
            targetId: r.targetId,
            reason: r.reason,
            status: r.status,
          }))}
          equipment={equipRows.map((r) => ({
            id: r.model.id,
            name: `${r.manufacturer.name} ${r.model.name}`,
            category: r.model.category,
            isVerified: r.model.isVerified,
          }))}
        />
      </div>
    </div>
  );
}
