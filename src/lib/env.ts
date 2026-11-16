import "server-only";
import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : undefined));

const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 chars"),
  BETTER_AUTH_URL: z.url(),
  // Google sign-in is offered only when both are set. Empty strings (as
  // copied from .env.example) count as unset.
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Invalid environment variables. See .env.example.");
}

export const env = parsed.data;
