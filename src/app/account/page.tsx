import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/ui/container";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

/* Session-dependent, so the details render in <Suspense>. */
export default function AccountPage() {
  return (
    <Container width="narrow" className="pt-14 pb-24 md:pt-20">
      <p className="eyebrow">Your account</p>
      <Suspense fallback={<div aria-busy="true" className="min-h-60" />}>
        <AccountDetails />
      </Suspense>
    </Container>
  );
}

async function AccountDetails() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in?next=/account");
  const { user } = session;

  return (
    <>
      <h1 className="mt-3">Hello, {user.name}</h1>

      <dl className="hairline-t mt-10 divide-y divide-line">
        <div className="flex justify-between gap-6 py-4 text-sm">
          <dt className="text-ink-muted">Name</dt>
          <dd>{user.name}</dd>
        </div>
        <div className="flex justify-between gap-6 py-4 text-sm">
          <dt className="text-ink-muted">Email</dt>
          <dd className="break-all">{user.email}</dd>
        </div>
      </dl>

      <section aria-labelledby="orders-title" className="mt-14">
        <h2 id="orders-title" className="text-xl md:text-2xl">
          Orders
        </h2>
        {/* Filled in once checkout records orders. */}
        <p className="text-meta mt-3">You haven&rsquo;t placed any orders yet.</p>
      </section>

      <div className="mt-14">
        <SignOutButton />
      </div>
    </>
  );
}
