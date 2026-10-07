"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/features/gear/actions";

export function ProfileEditor({
  initial,
}: {
  initial: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    allowDatasetUse: boolean;
    allowAudioTrainingUse: boolean;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="grid max-w-xl gap-3 border border-border/50 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        try {
          await updateProfileAction({
            displayName: String(fd.get("displayName")),
            bio: String(fd.get("bio") || ""),
            location: String(fd.get("location") || ""),
            website: String(fd.get("website") || ""),
            allowDatasetUse: fd.get("allowDatasetUse") === "on",
            allowAudioTrainingUse: fd.get("allowAudioTrainingUse") === "on",
          });
          toast.success("Profile updated");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="font-heading text-lg">Edit profile</h2>
      <div className="space-y-1">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" name="displayName" defaultValue={initial.displayName} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={initial.bio} rows={3} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={initial.location} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={initial.website} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="allowDatasetUse" defaultChecked={initial.allowDatasetUse} />
        Allow structured tone data for future dataset use
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="allowAudioTrainingUse"
          defaultChecked={initial.allowAudioTrainingUse}
        />
        Allow audio demos for future training use
      </label>
      <Button type="submit" disabled={busy}>
        Save profile
      </Button>
    </form>
  );
}
