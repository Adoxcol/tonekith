import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-heading font-semibold lowercase">tonekith</span>
          {" — find your tone. make it yours."}
        </p>
        <div className="flex gap-4">
          <Link href="/tones" className="hover:text-foreground">
            Browse tones
          </Link>
          <Link href="/search" className="hover:text-foreground">
            Search
          </Link>
        </div>
      </div>
    </footer>
  );
}
