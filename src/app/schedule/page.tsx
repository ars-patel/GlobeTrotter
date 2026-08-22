import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-header";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function SchedulePage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const now = new Date();
  const monthStr =
    sp.month && /^\d{4}-\d{2}$/.test(sp.month)
      ? sp.month
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [y, m] = monthStr.split("-").map(Number);
  const monthStart = `${monthStr}-01`;
  const monthEndDate = new Date(y, m, 0);
  const monthEnd = `${monthStr}-${String(monthEndDate.getDate()).padStart(2, "0")}`;

  const { rows: trips } = await query(
    `SELECT id, name, start_date, end_date
     FROM trips
     WHERE user_id = $1
       AND start_date <= $3::date
       AND end_date >= $2::date
     ORDER BY start_date ASC`,
    [user.id, monthStart, monthEnd]
  );

  const { rows: activityDays } = await query<{ day_date: string; title: string }>(
    `SELECT ta.day_date::text AS day_date, a.name AS title
     FROM trip_activities ta
     JOIN activities a ON a.id = ta.activity_id
     JOIN trip_stops s ON s.id = ta.stop_id
     JOIN trips t ON t.id = s.trip_id
     WHERE t.user_id = $1
       AND ta.day_date BETWEEN $2::date AND $3::date
     ORDER BY ta.day_date ASC`,
    [user.id, monthStart, monthEnd]
  );

  const highlighted = new Set<string>();
  for (const t of trips) {
    const start = new Date(String(t.start_date));
    const end = new Date(String(t.end_date));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      if (key >= monthStart && key <= monthEnd) highlighted.add(key);
    }
  }
  for (const a of activityDays) {
    highlighted.add(String(a.day_date).slice(0, 10));
  }

  const firstDow = new Date(y, m - 1, 1).getDay();
  const daysInMonth = monthEndDate.getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;

  return (
    <AppShell user={user}>
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
            <p className="text-sm text-muted-foreground">
              Highlighted days come from your trips and activities
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <a href={`/schedule?month=${prev}`} className="underline-offset-4 hover:underline">
              Prev
            </a>
            <span className="font-medium">{monthStr}</span>
            <a href={`/schedule?month=${next}`} className="underline-offset-4 hover:underline">
              Next
            </a>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day == null) return <div key={`e-${i}`} />;
            const key = `${monthStr}-${String(day).padStart(2, "0")}`;
            const on = highlighted.has(key);
            return (
              <div
                key={key}
                className={`rounded-md border py-3 text-sm ${
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">Trips this month</h2>
          {trips.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trips overlap this month.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {trips.map((t) => (
                <li key={t.id}>
                  <a
                    href={`/trips/${t.id}/calendar`}
                    className="underline-offset-4 hover:underline"
                  >
                    {t.name}
                  </a>{" "}
                  <span className="text-muted-foreground">
                    ({String(t.start_date).slice(0, 10)} – {String(t.end_date).slice(0, 10)})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </AppShell>
  );
}
