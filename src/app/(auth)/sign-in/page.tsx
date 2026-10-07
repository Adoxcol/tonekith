"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-heading text-3xl tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome back. Demo users: maya@tone.local / password123
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          const fd = new FormData(e.currentTarget);
          const res = await signIn.email({
            email: String(fd.get("email")),
            password: String(fd.get("password")),
          });
          setLoading(false);
          if (res.error) {
            setError(res.error.message || "Sign in failed");
            return;
          }
          router.push("/");
          router.refresh();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/sign-up" className="text-amber-300 hover:underline">
          Join ToneAtlas
        </Link>
      </p>
    </div>
  );
}
