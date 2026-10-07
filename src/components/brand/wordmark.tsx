import { cn } from "@/lib/utils";

function AmpKnob({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("inline-block shrink-0 text-foreground", className)}
      aria-hidden
    >
      <circle
        cx="24"
        cy="24"
        r="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
      />
      <line
        x1="24"
        y1="24"
        x2="34.5"
        y2="14"
        stroke="#FF7A00"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="8"
        x2="39"
        y2="4.5"
        stroke="#FF7A00"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="40.5"
        y1="12"
        x2="44"
        y2="9.5"
        stroke="#FF7A00"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="42"
        y1="17.5"
        x2="46"
        y2="16"
        stroke="#FF7A00"
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
}: {
  className?: string;
  knobClassName?: string;
  accent?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-sans font-semibold tracking-tight lowercase",
        accent ? "text-[var(--brand-orange)]" : "text-foreground",
        className,
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
  );
}

/** Alternate t+knob mark for header compact / favicon-style use */
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
        d="M18 10h28M32 10v18"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle
        cx="32"
        cy="42"
        r="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
      />
      <line
        x1="32"
        y1="42"
        x2="40.5"
        y2="33.5"
        stroke="#FF7A00"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="42"
        y1="26"
        x2="44.5"
        y2="23"
        stroke="#FF7A00"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="46"
        y1="29"
        x2="49"
        y2="27"
        stroke="#FF7A00"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="47.5"
        y1="34"
        x2="51"
        y2="33"
        stroke="#FF7A00"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
