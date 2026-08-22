import { AppHeader } from "@/components/layout/app-header";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">User Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Full profile editing lands in the Profile topic. Signed in as{" "}
          <span className="font-medium text-foreground">
            {user?.email ?? "unknown"}
          </span>
          .
        </p>
      </main>
    </div>
  );
}
