import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/** Legacy alias → unified city search */
export default async function CitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const q = new URLSearchParams();
  q.set("type", "city");
  if (sp.q) q.set("q", sp.q);
  if (sp.country) q.set("country", sp.country);
  if (sp.region) q.set("region", sp.region);
  if (sp.tripId) q.set("tripId", sp.tripId);
  if (sp.sort) q.set("sort", sp.sort);
  redirect(`/search?${q.toString()}`);
}
