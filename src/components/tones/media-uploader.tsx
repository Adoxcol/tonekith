"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MediaUploader({ toneId }: { toneId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function upload(kind: "screenshot" | "preset" | "audio", file: File | null) {
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("toneId", toneId);
    fd.set("kind", kind);
    fd.set("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Upload failed");
      return;
    }
    toast.success("Uploaded");
    router.refresh();
  }

  return (
    <section className="space-y-4 border border-border/50 p-4">
      <h2 className="font-heading text-xl">Media</h2>
      <p className="text-sm text-muted-foreground">
        Screenshots (5MB), presets (2MB), audio demos (10MB). Never executed server-side.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="screenshot">Screenshot</Label>
          <Input
            id="screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={(e) => upload("screenshot", e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preset">Preset file</Label>
          <Input
            id="preset"
            type="file"
            disabled={busy}
            onChange={(e) => upload("preset", e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="audio">Audio demo</Label>
          <Input
            id="audio"
            type="file"
            accept="audio/mpeg,audio/wav,audio/mp4,.mp3,.wav,.m4a"
            disabled={busy}
            onChange={(e) => upload("audio", e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
      <Button type="button" variant="outline" disabled={busy} onClick={() => router.refresh()}>
        Refresh media list
      </Button>
    </section>
  );
}
