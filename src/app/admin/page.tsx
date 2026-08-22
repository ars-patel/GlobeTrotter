import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AdminStatsCharts } from "@/components/admin/admin-stats-charts";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdminStats } from "@/lib/admin/stats";
import { query } from "@/lib/db";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/discover");

  const stats = await getAdminStats();
  const { rows: users } = await query(
    `SELECT
       u.id,
       u.email,
       u.username,
       u.name,
       u.role::text AS role,
       u.created_at::text AS created_at,
       (SELECT COUNT(*)::int FROM trips t WHERE t.user_id = u.id) AS trip_count
     FROM users u
     ORDER BY u.created_at DESC
     LIMIT 100`
  );

  const cards = [
    { label: "Users", value: stats.totals.users },
    { label: "Trips", value: stats.totals.trips },
    { label: "Public trips", value: stats.totals.publicTrips },
    { label: "Trip activities", value: stats.totals.tripActivities },
    { label: "Cities catalog", value: stats.totals.cities },
    { label: "Community posts", value: stats.totals.communityPosts },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Admin analytics
              </h1>
              <Badge>ADMIN</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Platform usage, popular cities/activities, and user management
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.label} className="border-border shadow-none">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  {c.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold tabular-nums">
                {c.value}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-border shadow-none">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Users with trips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold tabular-nums">
              {stats.engagement.usersWithTrips}
            </CardContent>
          </Card>
          <Card className="border-border shadow-none">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Avg trips / user
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold tabular-nums">
              {stats.engagement.avgTripsPerUser}
            </CardContent>
          </Card>
          <Card className="border-border shadow-none">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Avg activities / trip
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold tabular-nums">
              {stats.engagement.avgActivitiesPerTrip}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charts">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="mt-4 space-y-4">
            <AdminStatsCharts stats={stats} />
          </TabsContent>

          <TabsContent value="tables" className="mt-4 space-y-6">
            <section className="space-y-3">
              <h2 className="text-base font-semibold">Top cities</h2>
              <div className="rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Stops</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topCities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground">
                          No data
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.topCities.map((c) => (
                        <TableRow key={`${c.name}-${c.country}`}>
                          <TableCell>{c.name}</TableCell>
                          <TableCell>{c.country}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {c.stop_count}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">Top activities</h2>
              <div className="rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Uses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topActivities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground">
                          No data
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.topActivities.map((a) => (
                        <TableRow key={a.name}>
                          <TableCell>{a.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{a.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {a.use_count}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="users" className="mt-4 space-y-3">
            <h2 className="text-base font-semibold">User management</h2>
            <p className="text-sm text-muted-foreground">
              Promote or demote admins. Password hashes are never exposed.
            </p>
            <AdminUsersTable
              users={users.map((u) => ({
                id: String(u.id),
                email: String(u.email),
                username: u.username == null ? null : String(u.username),
                name: String(u.name),
                role: u.role === "ADMIN" ? "ADMIN" : "USER",
                created_at: String(u.created_at).slice(0, 10),
                trip_count: Number(u.trip_count),
              }))}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
