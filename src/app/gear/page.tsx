import { redirect } from "next/navigation";
import { GearManager } from "@/components/gear/gear-manager";
import { getGearForUser } from "@/features/gear/actions";
import { db } from "@/db/client";
import { equipmentManufacturers, equipmentModels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/server/session";

export default async function GearPage() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  const [mine, catalog] = await Promise.all([
    getGearForUser(session.user.id),
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
      .limit(100),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-3xl tracking-tight">My Gear</h1>
      <p className="mt-2 text-muted-foreground">
        Your personal rig — used for tone matching and future gear-aware suggestions.
      </p>
      <div className="mt-8">
        <GearManager
          items={mine.map((r) => ({
            id: r.gear.id,
            nickname: r.gear.nickname,
            notes: r.gear.notes,
            isPrimary: r.gear.isPrimary,
            modelName: r.model.name,
            manufacturerName: r.manufacturer.name,
            category: r.model.category,
          }))}
          catalog={catalog.map((r) => ({
            id: r.model.id,
            label: `${r.manufacturer.name} ${r.model.name}`,
            category: r.model.category,
          }))}
        />
      </div>
    </div>
  );
}
