import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-header";
import { CommunityComposer } from "@/components/community/community-composer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

export default async function CommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { rows } = await query(
    `SELECT
       p.id, p.body, p.created_at,
       u.first_name, u.last_name, u.username
     FROM community_posts p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC
     LIMIT 50`
  );

  return (
    <AppShell user={user}>
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-6 py-8 lg:grid-cols-[1fr_280px]">
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Community Talk</h1>
            <p className="text-sm text-muted-foreground">
              Tips, trip stories, and questions from fellow travelers
            </p>
          </div>

          {rows.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>No talks yet</EmptyTitle>
                <EmptyDescription>Share your thoughts in the sidebar.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {rows.map((p) => (
                <Card key={p.id} className="border-border shadow-none">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <Avatar>
                      <AvatarFallback>
                        {String(p.first_name).slice(0, 1)}
                        {String(p.last_name).slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleString()}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {p.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <CommunityComposer />
        </aside>
      </main>
    </AppShell>
  );
}
