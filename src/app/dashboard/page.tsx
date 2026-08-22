import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/** Legacy PS “Dashboard” route — home hub lives at /discover. */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect("/discover");
}
