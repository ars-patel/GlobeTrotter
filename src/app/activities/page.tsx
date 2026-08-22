import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/** Alias → Activity search with optional city/trip scope */
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
  if (sp.cityId) q.set("cityId", sp.cityId);
  if (sp.tripId) q.set("tripId", sp.tripId);
  if (sp.stopId) q.set("stopId", sp.stopId);
  if (sp.activityType) q.set("activityType", sp.activityType);
  if (sp.maxCost) q.set("maxCost", sp.maxCost);
  if (sp.maxDuration) q.set("maxDuration", sp.maxDuration);
  if (sp.country) q.set("country", sp.country);
  redirect(`/search?${q.toString()}`);
}
