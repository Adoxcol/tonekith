import { cn } from "@/lib/utils";

/** Amp-knob glyph matching the brand board (open ring + orange pointer + ticks). */
function AmpKnob({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("inline-block shrink-0 text-foreground", className)}
      aria-hidden
    >
      <path
        d="M16 12.5 A14 14 0 1 0 32 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="26"
        x2="31.5"
        y2="15.5"
        stroke="#FF7A00"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <line
        x1="22.5"
        y1="7"
        x2="21.5"
        y2="3.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="24.5"
        y1="6.2"
        x2="24.5"
        y2="2.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="26.5"
        y1="7"
        x2="27.5"
        y2="3.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Primary wordmark: Sora letters + amp-knob “o” */
export function TonekithWordmark({
  className,
  knobClassName,
  accent = false,
  showTagline = false,
}: {
  className?: string;
  knobClassName?: string;
  accent?: boolean;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col items-start", className)}>
      <span
        className={cn(
          "inline-flex items-baseline font-sans font-semibold tracking-tight lowercase",
          accent ? "text-[var(--brand-orange)]" : "text-foreground",
        )}
        aria-label="tonekith"
      >
        <span>t</span>
        <AmpKnob
          className={cn(
            "mx-[0.04em] translate-y-[0.12em]",
            knobClassName ?? "h-[0.92em] w-[0.92em]",
          )}
        />
        <span>n</span>
        <span>e</span>
        <span>k</span>
        <span>i</span>
        <span>t</span>
        <span>h</span>
      </span>
      {showTagline ? (
        <span className="mt-2 font-sans text-[0.22em] font-medium tracking-[0.28em] text-muted-foreground uppercase">
          Find your tone. Make it yours.
        </span>
      ) : null}
    </span>
  );
}

/** Knob mark for header compact / favicon-style use */
export function TonekithMark({
  className,
  title = "tonekith",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("text-foreground", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d="M20 18.5 A16 16 0 1 0 44 18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="34"
        x2="41"
        y2="21"
        stroke="#FF7A00"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="11"
        x2="28.8"
        y2="6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="32.5"
        y1="10"
        x2="32.5"
        y2="5.2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="35"
        y1="11"
        x2="36.2"
        y2="6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
