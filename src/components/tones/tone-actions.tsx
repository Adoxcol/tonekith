"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  forkToneAction,
  markTriedAction,
  rateToneAction,
  submitFeedbackAction,
  toggleFavoriteAction,
  addCommentAction,
} from "@/features/tones/actions";
import { FEEDBACK_TAGS } from "@/validation/tone";

export function ToneActions({
  toneId,
  favorited,
  tried,
  isAuthed,
}: {
  toneId: string;
  favorited: boolean;
  tried: boolean;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!isAuthed) {
    return (
      <p className="text-sm text-muted-foreground">
        <a href="/sign-in" className="text-[var(--brand-orange)] hover:underline">
          Sign in
        </a>{" "}
        to rate, save, try, or fork this tone.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await toggleFavoriteAction(toneId);
            setBusy(false);
            router.refresh();
          }}
        >
          {favorited ? "Saved" : "Save"}
        </Button>
        <Button
          variant="outline"
          disabled={busy || tried}
          onClick={async () => {
            setBusy(true);
            await markTriedAction(toneId);
            toast.success("Marked as tried");
            setBusy(false);
            router.refresh();
          }}
        >
          {tried ? "Tried" : "I tried this"}
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const res = await forkToneAction(toneId);
            setBusy(false);
            toast.success("Fork created as draft");
            router.push(`/tones/${res.tone.id}/edit`);
          }}
        >
          Fork
        </Button>
      </div>

      <form
        className="grid gap-3 sm:grid-cols-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setBusy(true);
          try {
            await rateToneAction({
              toneId,
              overall: Number(fd.get("overall")),
              accuracy: Number(fd.get("accuracy")),
              soundQuality: Number(fd.get("soundQuality")),
              usefulness: Number(fd.get("usefulness")),
            });
            toast.success("Rating saved");
            router.refresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        <h3 className="font-heading text-lg sm:col-span-4">Rate this tone</h3>
        {(
          [
            ["overall", "Overall"],
            ["accuracy", "Accuracy"],
            ["soundQuality", "Sound quality"],
            ["usefulness", "Usefulness"],
          ] as const
        ).map(([name, label]) => (
          <div key={name} className="space-y-1">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
              type="number"
              min={1}
              max={5}
              defaultValue={5}
              required
            />
          </div>
        ))}
        <Button type="submit" className="sm:col-span-4" disabled={busy}>
          Submit rating
        </Button>
      </form>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const tags = fd.getAll("tags").map(String);
          if (!tags.length) {
            toast.error("Pick at least one feedback tag");
            return;
          }
          setBusy(true);
          await submitFeedbackAction({
            toneId,
            tags,
            comment: String(fd.get("comment") || ""),
          });
          toast.success("Feedback submitted");
          setBusy(false);
          router.refresh();
        }}
      >
        <h3 className="font-heading text-lg">Structured feedback</h3>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_TAGS.map((tag) => (
            <label
              key={tag}
              className="inline-flex items-center gap-2 border border-border/60 px-2 py-1 text-xs"
            >
              <input type="checkbox" name="tags" value={tag} />
              {tag.replaceAll("_", " ")}
            </label>
          ))}
        </div>
        <Textarea name="comment" placeholder="Optional note" rows={3} />
        <Button type="submit" variant="outline" disabled={busy}>
          Send feedback
        </Button>
      </form>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setBusy(true);
          await addCommentAction({
            toneId,
            body: String(fd.get("body")),
          });
          (e.target as HTMLFormElement).reset();
          setBusy(false);
          router.refresh();
        }}
      >
        <h3 className="font-heading text-lg">Comment</h3>
        <Textarea name="body" required rows={3} placeholder="Share a tip or question" />
        <Button type="submit" disabled={busy}>
          Post comment
        </Button>
      </form>
    </div>
  );
}
