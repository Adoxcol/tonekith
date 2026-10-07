"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addUserGearAction,
  removeUserGearAction,
  submitEquipmentAction,
} from "@/features/gear/actions";

type Item = {
  id: string;
  nickname: string | null;
  notes: string | null;
  isPrimary: boolean;
  modelName: string;
  manufacturerName: string;
  category: string;
};

export function GearManager({
  items,
  catalog,
}: {
  items: Item[];
  catalog: Array<{ id: string; label: string; category: string }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-heading text-xl">In your rig</h2>
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No gear yet. Add from the catalog.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/50">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">
                    {item.manufacturerName} {item.modelName}
                    {item.isPrimary ? " · primary" : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                    {item.nickname ? ` · ${item.nickname}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    await removeUserGearAction(item.id);
                    setBusy(false);
                    router.refresh();
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl">Add from catalog</h2>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            await addUserGearAction({
              equipmentModelId: String(fd.get("equipmentModelId")),
              nickname: String(fd.get("nickname") || "") || undefined,
            });
            toast.success("Added to rig");
            setBusy(false);
            router.refresh();
          }}
        >
          <select
            name="equipmentModelId"
            required
            className="h-9 min-w-56 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} ({c.category})
              </option>
            ))}
          </select>
          <Input name="nickname" placeholder="Nickname (optional)" className="max-w-xs" />
          <Button type="submit" disabled={busy}>
            Add
          </Button>
        </form>
      </section>

      <section className="space-y-3 border border-border/50 p-4">
        <h2 className="font-heading text-xl">Submit missing gear</h2>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            try {
              await submitEquipmentAction({
                manufacturerName: String(fd.get("manufacturerName")),
                modelName: String(fd.get("modelName")),
                category: String(fd.get("category")),
                description: String(fd.get("description") || ""),
              });
              toast.success("Submitted for catalog");
              (e.target as HTMLFormElement).reset();
              router.refresh();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="manufacturerName">Manufacturer</Label>
            <Input id="manufacturerName" name="manufacturerName" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="modelName">Model</Label>
            <Input id="modelName" name="modelName" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              defaultValue="PEDAL"
            >
              {[
                "GUITAR",
                "AMP",
                "AMP_SIM",
                "CABINET",
                "PEDAL",
                "MULTI_EFFECT",
                "PLUGIN",
                "AUDIO_INTERFACE",
                "MICROPHONE",
                "OTHER",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
          <Button type="submit" disabled={busy} className="sm:col-span-2">
            Submit equipment
          </Button>
        </form>
      </section>
    </div>
  );
}
