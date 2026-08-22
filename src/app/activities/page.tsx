import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const q = new URLSearchParams();
  q.set("type", "activity");
  if (sp.q) q.set("q", sp.q);
  redirect(`/search?${q.toString()}`);
}
