import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { env } from "@/lib/env";

const google =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
    : undefined;

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
  account: {
    accountLinking: {
      // Google verifies the email it returns, so signing in with Google links
      // to an existing email/password account with the same address instead
      // of failing with account_not_linked.
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  // nextCookies must stay last in the plugins array.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
