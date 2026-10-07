"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { TonekithMark, TonekithWordmark } from "@/components/brand/wordmark";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";

const links = [
  { href: "/artists", label: "Artists" },
  { href: "/songs", label: "Songs" },
  { href: "/tones", label: "Tones" },
  { href: "/search", label: "Search" },
  { href: "/gear", label: "My Gear" },
];

export function SiteHeader() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const nav = (
    <nav className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 tracking-tight"
            aria-label="tonekith home"
          >
            <TonekithMark className="size-7" />
            <TonekithWordmark className="hidden text-lg sm:inline-flex" />
          </Link>
          <div className="hidden md:block">{nav}</div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <Search className="size-4" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="size-4 dark:hidden" />
            <Moon className="hidden size-4 dark:block" />
          </Button>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                {session.user.name}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/u/${session.user.id}`)}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/tones/new")}>
                  Create tone
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/gear")}>My Gear</DropdownMenuItem>
                {(session.user as { role?: string }).role === "admin" && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>Admin</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    router.refresh();
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Sign in
              </Link>
              <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }))}>
                Join
              </Link>
            </div>
          )}

          <Sheet>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
              aria-label="Menu"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-10">
              {nav}
              <div className="mt-6 flex flex-col gap-2">
                {session?.user ? (
                  <Link href="/tones/new" className={cn(buttonVariants())}>
                    Create tone
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-up" className={cn(buttonVariants())}>
                      Join
                    </Link>
                    <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline" }))}>
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
