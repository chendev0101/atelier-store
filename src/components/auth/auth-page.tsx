import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/ui/container";
import { auth, googleSignInEnabled } from "@/lib/auth";
import { safeNext } from "@/lib/safe-redirect";

type Mode = "sign-in" | "sign-up";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const headings: Record<Mode, { eyebrow: string; title: string }> = {
  "sign-in": { eyebrow: "Welcome back", title: "Sign in" },
  "sign-up": { eyebrow: "Join Atelier", title: "Create an account" },
};

/**
 * Shared shell for /sign-in and /sign-up. The heading is static; the form
 * depends on the request (session cookie, ?next=), so it renders in Suspense.
 */
export function AuthPage({ mode, searchParams }: { mode: Mode; searchParams: SearchParams }) {
  const { eyebrow, title } = headings[mode];
  return (
    <Container width="narrow" className="pt-14 pb-24 md:pt-20">
      <div className="mx-auto max-w-sm">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3">{title}</h1>
        <div className="mt-10">
          <Suspense fallback={<div aria-busy="true" className="min-h-72" />}>
            <AuthFormForRequest mode={mode} searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}

async function AuthFormForRequest({ mode, searchParams }: { mode: Mode; searchParams: SearchParams }) {
  const next = safeNext((await searchParams).next);
  // Already signed in: skip the form.
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(next);
  return <AuthForm mode={mode} next={next} googleEnabled={googleSignInEnabled} />;
}
