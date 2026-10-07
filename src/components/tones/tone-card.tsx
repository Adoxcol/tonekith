import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ToneCardProps = {
  id: string;
  title: string;
  artistName: string;
  songTitle: string;
  platform: string | null;
  avgRating: number | null;
  toneType: string;
  creatorName: string;
};

export function ToneCard(props: ToneCardProps) {
  return (
    <Link
      href={`/tones/${props.id}`}
      className="group block border-b border-border/50 py-4 transition-colors hover:bg-white/[0.02]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium tracking-tight group-hover:text-[var(--brand-orange)]">
            {props.title}
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {props.artistName} — {props.songTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">by {props.creatorName}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1 text-sm tabular-nums text-[var(--brand-orange)]">
            <Star className="size-3.5 fill-current" aria-hidden />
            {(props.avgRating ?? 0).toFixed(1)}
          </span>
          <div className="flex gap-1">
            {props.platform && <Badge variant="secondary">{props.platform}</Badge>}
            <Badge variant="outline">{props.toneType.replaceAll("_", " ")}</Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
