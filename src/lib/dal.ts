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
 *
 * Two levels: admins can view and change everything; the demo role can
 * open the back office read-only, so every write refuses it.
 */

export const DEMO_READ_ONLY_MESSAGE = "This is a read-only demo account, so changes aren't saved.";

export class AdminAuthError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
  }
}

/** The signed-in user, once per request. */
export const getCurrentUser = cache(async () => {
  // Session checks read the clock; keep them out of every prerender.
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

export type AdminViewer = { id: string; email: string; readOnly: boolean };

function toViewer(user: { id: string; email: string; role?: string | null }): AdminViewer | null {
  if (user.role === "admin") return { id: user.id, email: user.email, readOnly: false };
  if (user.role === "demo") return { id: user.id, email: user.email, readOnly: true };
  return null;
}

/**
 * For admin pages: signed-out visitors go to sign-in; anyone who can't view
 * the admin gets a 404, so the admin's existence isn't advertised.
 */
export async function requireAdmin(next = "/admin"): Promise<AdminViewer> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(safeNext(next, "/admin"))}`);
  const viewer = toViewer(user);
  if (!viewer) notFound();
  return viewer;
}

/** For admin queries: admins and the read-only demo role may read. */
export async function assertAdminAccess(): Promise<AdminViewer> {
  const user = await getCurrentUser();
  const viewer = user && toViewer(user);
  if (!viewer) throw new AdminAuthError();
  return viewer;
}

/** For admin Server Actions: only real admins may write. */
export async function assertAdmin(): Promise<{ id: string; email: string }> {
  const viewer = await assertAdminAccess();
  if (viewer.readOnly) throw new AdminAuthError(DEMO_READ_ONLY_MESSAGE);
  return { id: viewer.id, email: viewer.email };
}

/**
 * assertAdmin() for Server Actions that report errors as form state rather
 * than throwing: returns the actor, or the message to show.
 */
export async function authorizeAdminWrite(): Promise<
  { ok: true; actor: { id: string; email: string } } | { ok: false; error: string }
> {
  try {
    return { ok: true, actor: await assertAdmin() };
  } catch (e) {
    if (e instanceof AdminAuthError) return { ok: false, error: e.message };
    throw e;
  }
}
