import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { safeNext } from "@/lib/safe-redirect";

/*
 * Data access layer for authorisation. Every admin page, Server Action and
 * admin query calls one of these itself: layouts don't re-run on client
 * navigation, and Server Actions are public endpoints anyone can POST to.
 */

export class AdminAuthError extends Error {
  constructor() {
    super("Not authorised");
  }
}

/** The signed-in user, once per request. */
export const getCurrentUser = cache(async () => {
  // Session checks read the clock; keep them out of every prerender.
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

/**
 * For admin pages: signed-out visitors go to sign-in, everyone else who
 * isn't an admin gets a 404, so the admin's existence isn't advertised.
 */
export async function requireAdmin(next = "/admin") {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(safeNext(next, "/admin"))}`);
  if (user.role !== "admin") notFound();
  return user;
}

/** For admin Server Actions and queries: throws unless the user is an admin. */
export async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new AdminAuthError();
  return { id: user.id, email: user.email };
}
