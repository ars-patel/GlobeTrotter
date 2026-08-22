import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getCurrentUser } from "@/lib/auth/session";

/** Legacy route — prefer /discover (mockup Design 3). */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Moved to{" "}
          <a href="/discover" className="underline underline-offset-4">
            Discover
          </a>{" "}
          per the official mockup. This route remains for compatibility.
        </p>
      </main>
    </div>
  );
}
