import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}
