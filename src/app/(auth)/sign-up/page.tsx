"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-heading text-3xl tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Share structured tone recipes with the community.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          const fd = new FormData(e.currentTarget);
          const res = await signUp.email({
            name: String(fd.get("name")),
            email: String(fd.get("email")),
            password: String(fd.get("password")),
          });
          setLoading(false);
          if (res.error) {
            setError(res.error.message || "Sign up failed");
            return;
          }
          router.push("/");
          router.refresh();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
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
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Join"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-amber-300 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
