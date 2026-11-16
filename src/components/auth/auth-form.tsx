"use client";

import { useRouter } from "next/navigation";
import { type SubmitEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  /** Same-site path to continue to afterwards; already validated by the page. */
  next: string;
  googleEnabled: boolean;
};

const copy = {
  "sign-in": {
    submit: "Sign in",
    pending: "Signing in…",
    switchPrompt: "New to Atelier?",
    switchLabel: "Create an account",
    switchHref: "/sign-up",
  },
  "sign-up": {
    submit: "Create account",
    pending: "Creating account…",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/sign-in",
  },
} as const;

/** Google first (when configured), then email + password. Shared by both auth pages. */
export function AuthForm({ mode, next, googleEnabled }: AuthFormProps) {
  const router = useRouter();
  const errorId = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"email" | "google" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const text = copy[mode];

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending("email");
    setError(null);
    const { error } =
      mode === "sign-up"
        ? await authClient.signUp.email({ name: String(form.get("name") ?? ""), email, password })
        : await authClient.signIn.email({ email, password });

    if (error) {
      setPending(null);
      // Better Auth's messages are generic for wrong credentials, so they
      // don't reveal whether an email is registered.
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function onGoogle() {
    setPending("google");
    setError(null);
    // On success the browser leaves for Google, so `pending` stays set.
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: next });
    if (error) {
      setPending(null);
      setError(error.message ?? "Google sign-in failed. Please try again.");
    }
  }

  const switchHref =
    next === "/account" ? text.switchHref : `${text.switchHref}?next=${encodeURIComponent(next)}`;
  const describedBy = error ? errorId : undefined;

  return (
    <div>
      {googleEnabled && (
        <>
          <Button variant="secondary" block onClick={onGoogle} disabled={pending !== null}>
            <span className="inline-flex items-center gap-3">
              <GoogleMark />
              {pending === "google" ? "Redirecting to Google…" : "Continue with Google"}
            </span>
          </Button>
          <div className="my-8 flex items-center gap-4" role="separator">
            <span className="hairline-t flex-1" />
            <span className="eyebrow text-ink-muted">or with email</span>
            <span className="hairline-t flex-1" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-7" aria-describedby={describedBy}>
        {mode === "sign-up" && (
          <label className="block">
            <span className="eyebrow text-ink-muted">Name</span>
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              className="field mt-1"
              aria-invalid={error ? true : undefined}
            />
          </label>
        )}
        <label className="block">
          <span className="eyebrow text-ink-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field mt-1"
            aria-invalid={error ? true : undefined}
          />
        </label>
        <div>
          <label className="block">
            <span className="eyebrow text-ink-muted">Password</span>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              className="field mt-1"
              aria-invalid={error ? true : undefined}
            />
          </label>
          <div className="mt-2 flex items-center justify-between gap-4">
            <span className="text-meta">{mode === "sign-up" ? "At least 8 characters." : ""}</span>
            <button
              type="button"
              className="link-nav text-xs text-ink-muted"
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>
        </div>

        {error && (
          <p id={errorId} role="alert" className="border-l-2 border-error pl-3 text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" block disabled={pending !== null}>
          {pending === "email" ? text.pending : text.submit}
        </Button>
      </form>

      <p className="text-meta hairline-t mt-10 pt-6">
        {text.switchPrompt}{" "}
        <TextLink href={switchHref} className="text-ink">
          {text.switchLabel}
        </TextLink>
      </p>
    </div>
  );
}

/** Google's "G" mark, per Google's sign-in branding guidelines. */
function GoogleMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
