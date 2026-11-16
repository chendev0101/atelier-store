import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { auth, googleSignInEnabled } from "@/lib/auth";
import type { ImageAsset } from "@/lib/catalog";
import { safeNext } from "@/lib/safe-redirect";
import { approachImage, ritualImage } from "@/lib/storefront-content";

type Mode = "sign-in" | "sign-up";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const content: Record<
  Mode,
  { eyebrow: string; title: string; lead: string; image: ImageAsset; perks?: string[] }
> = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in",
    lead: "Pick up where you left off: your bag, your orders and your details.",
    image: approachImage,
  },
  "sign-up": {
    eyebrow: "Join Atelier",
    title: "Create an account",
    lead: "An account keeps your orders and details in one place.",
    image: ritualImage,
    perks: [
      "Track orders and reorder favourites",
      "Check out faster with saved details",
      "Hear first about new formulations",
    ],
  },
};

/**
 * Shared layout for /sign-in and /sign-up: an editorial image beside the
 * form on large screens, the form alone on small ones. The copy is static;
 * the form depends on the request (session cookie, ?next=), so it renders
 * in Suspense.
 */
export function AuthPage({ mode, searchParams }: { mode: Mode; searchParams: SearchParams }) {
  const { eyebrow, title, lead, image, perks } = content[mode];

  return (
    <section aria-labelledby="auth-title" className="hairline-b grid lg:grid-cols-12">
      <div className="media-well hidden lg:col-span-6 lg:block lg:min-h-[calc(100svh-var(--spacing-header))]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          sizes="50vw"
          className="object-cover"
        />
      </div>

      <div className="container-page flex flex-col justify-center py-14 md:py-20 lg:col-span-6 lg:px-16 xl:px-24">
        <div className="w-full max-w-sm max-lg:mx-auto">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="auth-title" className="mt-3">
            {title}
          </h1>
          <p className="text-meta mt-4">{lead}</p>

          {perks && (
            <ul className="mt-6 space-y-2 text-sm">
              {perks.map((perk) => (
                <li key={perk} className="flex gap-3">
                  <span aria-hidden="true" className="text-moss">
                    —
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10">
            <Suspense fallback={<div aria-busy="true" className="min-h-80" />}>
              <AuthFormForRequest mode={mode} searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

async function AuthFormForRequest({ mode, searchParams }: { mode: Mode; searchParams: SearchParams }) {
  const next = safeNext((await searchParams).next);
  // Already signed in: skip the form.
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(next);
  return <AuthForm mode={mode} next={next} googleEnabled={googleSignInEnabled} />;
}
