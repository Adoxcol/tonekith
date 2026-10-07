import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center px-4 py-16">
      <h1 className="font-heading text-3xl tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        That tone, song, or page doesn&apos;t exist — or you don&apos;t have access.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-6")}>
        Back home
      </Link>
    </div>
  );
}
