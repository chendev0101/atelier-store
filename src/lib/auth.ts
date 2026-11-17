import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { mergeGuestCart } from "@/db/queries/cart-merge";
import { CART_COOKIE } from "@/lib/cart";
import { env } from "@/lib/env";

const google =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
    : undefined;

/** Account-changing endpoints the shared demo login may not use. */
const DEMO_LOCKED_PATHS = new Set([
  "/update-user",
  "/change-email",
  "/change-password",
  "/delete-user",
  "/link-social",
  "/unlink-account",
  "/revoke-session",
  "/revoke-sessions",
  "/revoke-other-sessions",
]);

/** Whether the Google button should be shown; safe to pass to client components. */
export const googleSignInEnabled = Boolean(google);

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  // neon-http has no interactive transactions; the adapter's default
  // (`transaction: false`) runs multi-step writes sequentially.
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: google ? { google } : {},
  user: {
    additionalFields: {
      // input: false is what stops a client from promoting itself: Better
      // Auth rejects the field on sign-up and update-user. Admins are set
      // by hand in SQL.
      role: { type: "string", input: false, required: false, defaultValue: "customer" },
    },
  },
  account: {
    accountLinking: {
      // Google verifies the email it returns, so signing in with Google links
      // to an existing email/password account with the same address instead
      // of failing with account_not_linked.
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  hooks: {
    // The demo login is shared publicly, so nobody may change its password,
    // email or name, delete it, or sign everyone else out of it.
    before: createAuthMiddleware(async (ctx) => {
      if (!DEMO_LOCKED_PATHS.has(ctx.path)) return;
      const session = await getSessionFromCtx(ctx);
      if (session?.user.role === "demo") {
        throw new APIError("FORBIDDEN", { message: "The demo account can't be changed." });
      }
    }),
    // Any request that starts a session (email sign-in/up, OAuth callback)
    // folds the guest cart into the user's cart and drops the guest cookie.
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;
      const guestCartId = ctx.getCookie(CART_COOKIE);
      if (!newSession || !guestCartId) return;
      try {
        await mergeGuestCart(guestCartId, newSession.user.id);
        ctx.setCookie(CART_COOKIE, "", { path: "/", maxAge: 0 });
      } catch (e) {
        // Never fail a sign-in over the cart; the guest cart stays put.
        ctx.context.logger.error("Failed to merge guest cart", e);
      }
    }),
  },
  // nextCookies must stay last in the plugins array.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
