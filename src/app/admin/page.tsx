import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/dal";

export default function AdminIndexPage() {
  return (
    <Suspense>
      <ToProducts />
    </Suspense>
  );
}

async function ToProducts(): Promise<never> {
  await requireAdmin();
  return redirect("/admin/products");
}
