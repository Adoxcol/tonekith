"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createToneAction,
  publishToneAction,
  saveSignalChainAction,
  updateToneAction,
} from "@/features/tones/actions";

type ChainItem = {
  label: string;
  itemType: "GUITAR" | "AMP" | "PEDAL" | "PLUGIN" | "CABINET" | "MIC" | "OTHER";
  equipmentModelId?: string | null;
  isEnabled: boolean;
  isSoftware: boolean;
  parameters: Array<{
    key: string;
    dataType: "NUMBER" | "BOOLEAN" | "ENUM" | "TEXT";
    valueNumber?: number | null;
    valueBoolean?: boolean | null;
    valueText?: string | null;
    valueEnum?: string | null;
  }>;
};

type Props = {
  mode: "create" | "edit";
  toneId?: string;
  songs: Array<{ id: string; label: string }>;
  equipment: Array<{ id: string; label: string; category: string }>;
  initialSongId?: string;
  initial?: {
    songId: string;
    title: string;
    description: string;
    toneType: string;
    songSection: string;
    visibility: string;
    platform: string;
    tuning: string;
    capo: number;
    bpm?: number;
    notes: string;
    guitarEquipmentId?: string | null;
    ampEquipmentId?: string | null;
    status: string;
    chain: ChainItem[];
  };
};

const steps = ["Song", "Info", "Gear", "Chain", "Notes", "Publish"] as const;

export function ToneEditor(props: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [toneId, setToneId] = useState(props.toneId);
  const [form, setForm] = useState({
    songId: props.initial?.songId || props.initialSongId || props.songs[0]?.id || "",
    title: props.initial?.title || "",
    description: props.initial?.description || "",
    toneType: props.initial?.toneType || "RECREATION",
    songSection: props.initial?.songSection || "FULL_SONG",
    visibility: props.initial?.visibility || "PUBLIC",
    platform: props.initial?.platform || "",
    tuning: props.initial?.tuning || "EADGBE",
    capo: props.initial?.capo ?? 0,
    bpm: props.initial?.bpm,
    notes: props.initial?.notes || "",
    guitarEquipmentId: props.initial?.guitarEquipmentId || "",
    ampEquipmentId: props.initial?.ampEquipmentId || "",
  });
  const [chain, setChain] = useState<ChainItem[]>(
    props.initial?.chain?.length
      ? props.initial.chain
      : [
          {
            label: "Guitar",
            itemType: "GUITAR",
            isEnabled: true,
            isSoftware: false,
            parameters: [],
          },
        ],
  );

  async function persistDraft() {
    if (!form.title || !form.songId) {
      toast.error("Song and title are required");
      return null;
    }
    if (!toneId) {
      const res = await createToneAction({
        ...form,
        guitarEquipmentId: form.guitarEquipmentId || null,
        ampEquipmentId: form.ampEquipmentId || null,
        bpm: form.bpm ?? null,
      });
      setToneId(res.tone.id);
      await saveSignalChainAction({ toneId: res.tone.id, items: chain });
      return res.tone.id;
    }
    await updateToneAction({
      id: toneId,
      ...form,
      guitarEquipmentId: form.guitarEquipmentId || null,
      ampEquipmentId: form.ampEquipmentId || null,
      bpm: form.bpm ?? null,
    });
    await saveSignalChainAction({ toneId, items: chain });
    return toneId;
  }

  function moveItem(index: number, dir: -1 | 1) {
    const next = [...chain];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setChain(next);
  }

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2 text-xs">
        {steps.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => setStep(i)}
              className={`border px-2 py-1 ${i === step ? "border-[var(--brand-orange)] text-[var(--brand-orange)]" : "border-border/60 text-muted-foreground"}`}
            >
              {i + 1}. {s}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-3">
          <Label htmlFor="songId">Song</Label>
          <select
            id="songId"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={form.songId}
            onChange={(e) => setForm((f) => ({ ...f, songId: e.target.value }))}
          >
            {props.songs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="toneType">Tone type</Label>
              <select
                id="toneType"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={form.toneType}
                onChange={(e) => setForm((f) => ({ ...f, toneType: e.target.value }))}
              >
                {["STUDIO", "LIVE", "RECREATION", "INSPIRED_BY", "COVER", "CUSTOM"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="songSection">Song section</Label>
              <select
                id="songSection"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={form.songSection}
                onChange={(e) => setForm((f) => ({ ...f, songSection: e.target.value }))}
              >
                {[
                  "FULL_SONG",
                  "INTRO",
                  "VERSE",
                  "CHORUS",
                  "BRIDGE",
                  "RHYTHM",
                  "LEAD",
                  "SOLO",
                  "OUTRO",
                  "OTHER",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Input
              id="platform"
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              placeholder="Physical, Neural DSP, AmpliTube…"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="guitar">Guitar</Label>
            <select
              id="guitar"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={form.guitarEquipmentId}
              onChange={(e) => setForm((f) => ({ ...f, guitarEquipmentId: e.target.value }))}
            >
              <option value="">Select…</option>
              {props.equipment
                .filter((e) => e.category === "GUITAR")
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amp">Amp / sim</Label>
            <select
              id="amp"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={form.ampEquipmentId}
              onChange={(e) => setForm((f) => ({ ...f, ampEquipmentId: e.target.value }))}
            >
              <option value="">Select…</option>
              {props.equipment
                .filter((e) => e.category === "AMP" || e.category === "AMP_SIM")
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tuning">Tuning</Label>
            <Input
              id="tuning"
              value={form.tuning}
              onChange={(e) => setForm((f) => ({ ...f, tuning: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capo">Capo</Label>
            <Input
              id="capo"
              type="number"
              min={0}
              max={12}
              value={form.capo}
              onChange={(e) => setForm((f) => ({ ...f, capo: Number(e.target.value) }))}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {chain.map((item, index) => (
            <div key={index} className="space-y-2 border border-border/50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={item.label}
                  onChange={(e) => {
                    const next = [...chain];
                    next[index] = { ...item, label: e.target.value };
                    setChain(next);
                  }}
                  aria-label={`Chain item ${index + 1} label`}
                />
                <select
                  className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
                  value={item.itemType}
                  onChange={(e) => {
                    const next = [...chain];
                    next[index] = {
                      ...item,
                      itemType: e.target.value as ChainItem["itemType"],
                    };
                    setChain(next);
                  }}
                >
                  {["GUITAR", "AMP", "PEDAL", "PLUGIN", "CABINET", "MIC", "OTHER"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" size="sm" onClick={() => moveItem(index, -1)}>
                  Up
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => moveItem(index, 1)}>
                  Down
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setChain(chain.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {(item.parameters.length
                  ? item.parameters
                  : [{ key: "gain", dataType: "NUMBER" as const, valueNumber: 5 }]
                ).map((p, pi) => (
                  <div key={pi} className="space-y-1">
                    <Label>{p.key}</Label>
                    <Input
                      type="number"
                      value={p.valueNumber ?? 0}
                      onChange={(e) => {
                        const next = [...chain];
                        const params = [...(item.parameters.length ? item.parameters : [{ key: "gain", dataType: "NUMBER" as const, valueNumber: 5 }])];
                        params[pi] = {
                          ...params[pi],
                          key: p.key,
                          dataType: "NUMBER",
                          valueNumber: Number(e.target.value),
                        };
                        next[index] = { ...item, parameters: params };
                        setChain(next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setChain([
                ...chain,
                {
                  label: "New pedal",
                  itemType: "PEDAL",
                  isEnabled: true,
                  isSoftware: false,
                  parameters: [{ key: "mix", dataType: "NUMBER", valueNumber: 5 }],
                },
              ])
            }
          >
            Add chain item
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2">
          <Label htmlFor="notes">Performance notes</Label>
          <Textarea
            id="notes"
            rows={8}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4 border border-border/50 p-4">
          <h2 className="font-heading text-xl">Preview</h2>
          <p className="font-medium">{form.title || "Untitled"}</p>
          <p className="text-sm text-muted-foreground">{form.description}</p>
          <p className="text-sm">{chain.length} chain items · {form.platform || "No platform"}</p>
          <p className="text-sm text-muted-foreground">
            Status: {props.initial?.status || "DRAFT"} — publishing makes it public on the song page.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0 || pending}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await persistDraft();
                  toast.success("Draft saved");
                  setStep((s) => s + 1);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Save failed");
                }
              })
            }
          >
            Save & continue
          </Button>
        ) : (
          <Button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  const id = await persistDraft();
                  if (!id) return;
                  await publishToneAction(id);
                  toast.success("Published");
                  router.push(`/tones/${id}`);
                  router.refresh();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Publish failed");
                }
              })
            }
          >
            Publish tone
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                const id = await persistDraft();
                toast.success("Draft saved");
                if (id) router.push(`/tones/${id}/edit`);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Save failed");
              }
            })
          }
        >
          Save draft
        </Button>
      </div>
    </div>
  );
}
