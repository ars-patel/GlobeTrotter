import { AppHeader } from "@/components/layout/app-header";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CommunityPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Community Talk</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Posts will load dynamically from `/api/community/posts` in the Community topic.
        </p>
      </main>
    </div>
  );
}
