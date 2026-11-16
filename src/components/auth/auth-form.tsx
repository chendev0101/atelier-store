"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
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

/** Email + password form, with Google when configured. Shared by both auth pages. */
export function AuthForm({ mode, next, googleEnabled }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const text = copy[mode];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);
    const { error } =
      mode === "sign-up"
        ? await authClient.signUp.email({ name: String(form.get("name") ?? ""), email, password })
        : await authClient.signIn.email({ email, password });
    setPending(false);

    if (error) {
      // Better Auth's messages are generic for wrong credentials, so they
      // don't reveal whether an email is registered.
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function onGoogle() {
    setError(null);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: next });
    if (error) setError(error.message ?? "Google sign-in failed. Please try again.");
  }

  const switchHref = next === "/account" ? text.switchHref : `${text.switchHref}?next=${encodeURIComponent(next)}`;

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-6">
        {mode === "sign-up" && (
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input name="name" type="text" required autoComplete="name" className="field mt-2" />
          </label>
        )}
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" required autoComplete="email" className="field mt-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            className="field mt-2"
          />
          {mode === "sign-up" && <span className="text-meta mt-2 block">At least 8 characters.</span>}
        </label>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" block disabled={pending}>
          {pending ? text.pending : text.submit}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <p className="text-meta my-6 text-center">or</p>
          <Button variant="secondary" block onClick={onGoogle}>
            Continue with Google
          </Button>
        </>
      )}

      <p className="text-meta mt-8 text-center">
        {text.switchPrompt}{" "}
        <TextLink href={switchHref} className="text-ink">
          {text.switchLabel}
        </TextLink>
      </p>
    </div>
  );
}
