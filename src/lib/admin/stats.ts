import { query } from "@/lib/db";

export type AdminStats = {
  totals: {
    users: number;
    admins: number;
    trips: number;
    publicTrips: number;
    stops: number;
    tripActivities: number;
    cities: number;
    activities: number;
    communityPosts: number;
    savedDestinations: number;
  };
  engagement: {
    usersWithTrips: number;
    avgTripsPerUser: number;
    avgActivitiesPerTrip: number;
  };
  tripsByMonth: { month: string; count: number }[];
  topCities: { name: string; country: string; stop_count: number }[];
  topActivities: { name: string; type: string; use_count: number }[];
  recentUsers: {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
    trip_count: number;
  }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const [totalsRes, engagementRes, monthsRes, citiesRes, actsRes, usersRes] =
    await Promise.all([
      query<{
        users: string;
        admins: string;
        trips: string;
        public_trips: string;
        stops: string;
        trip_activities: string;
        cities: string;
        activities: string;
        community_posts: string;
        saved_destinations: string;
      }>(
        `SELECT
           (SELECT COUNT(*)::text FROM users) AS users,
           (SELECT COUNT(*)::text FROM users WHERE role = 'ADMIN') AS admins,
           (SELECT COUNT(*)::text FROM trips) AS trips,
           (SELECT COUNT(*)::text FROM trips WHERE is_public = TRUE) AS public_trips,
           (SELECT COUNT(*)::text FROM trip_stops) AS stops,
           (SELECT COUNT(*)::text FROM trip_activities) AS trip_activities,
           (SELECT COUNT(*)::text FROM cities) AS cities,
           (SELECT COUNT(*)::text FROM activities) AS activities,
           (SELECT COUNT(*)::text FROM community_posts) AS community_posts,
           (SELECT COUNT(*)::text FROM saved_destinations) AS saved_destinations`
      ),
      query<{
        users_with_trips: string;
        avg_trips: string;
        avg_acts: string;
      }>(
        `SELECT
           (SELECT COUNT(DISTINCT user_id)::text FROM trips) AS users_with_trips,
           (SELECT COALESCE(AVG(c), 0)::float::text
              FROM (SELECT COUNT(*)::float AS c FROM trips GROUP BY user_id) t
           ) AS avg_trips,
           (SELECT COALESCE(
              (SELECT COUNT(*)::float FROM trip_activities) /
              NULLIF((SELECT COUNT(*)::float FROM trips), 0),
              0
            )::text) AS avg_acts`
      ),
      query<{ month: string; count: string }>(
        `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
                COUNT(*)::text AS count
         FROM trips
         WHERE created_at >= (date_trunc('month', NOW()) - INTERVAL '11 months')
         GROUP BY 1
         ORDER BY 1 ASC`
      ),
      query<{ name: string; country: string; stop_count: string }>(
        `SELECT c.name, c.country, COUNT(s.id)::text AS stop_count
         FROM trip_stops s
         JOIN cities c ON c.id = s.city_id
         GROUP BY c.id, c.name, c.country
         ORDER BY COUNT(s.id) DESC, c.name ASC
         LIMIT 10`
      ),
      query<{ name: string; type: string; use_count: string }>(
        `SELECT a.name, a.type::text AS type, COUNT(ta.id)::text AS use_count
         FROM trip_activities ta
         JOIN activities a ON a.id = ta.activity_id
         GROUP BY a.id, a.name, a.type
         ORDER BY COUNT(ta.id) DESC, a.name ASC
         LIMIT 10`
      ),
      query<{
        id: string;
        email: string;
        name: string;
        role: string;
        created_at: string;
        trip_count: string;
      }>(
        `SELECT
           u.id,
           u.email,
           u.name,
           u.role::text AS role,
           u.created_at::text AS created_at,
           (SELECT COUNT(*)::text FROM trips t WHERE t.user_id = u.id) AS trip_count
         FROM users u
         ORDER BY u.created_at DESC
         LIMIT 25`
      ),
    ]);

  const t = totalsRes.rows[0];
  const e = engagementRes.rows[0];
  const usersCount = Number(t?.users ?? 0);

  // Fill missing months for chart continuity
  const monthMap = new Map(
    monthsRes.rows.map((r) => [r.month, Number(r.count)])
  );
  const tripsByMonth: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    tripsByMonth.push({ month: key, count: monthMap.get(key) ?? 0 });
  }

  return {
    totals: {
      users: usersCount,
      admins: Number(t?.admins ?? 0),
      trips: Number(t?.trips ?? 0),
      publicTrips: Number(t?.public_trips ?? 0),
      stops: Number(t?.stops ?? 0),
      tripActivities: Number(t?.trip_activities ?? 0),
      cities: Number(t?.cities ?? 0),
      activities: Number(t?.activities ?? 0),
      communityPosts: Number(t?.community_posts ?? 0),
      savedDestinations: Number(t?.saved_destinations ?? 0),
    },
    engagement: {
      usersWithTrips: Number(e?.users_with_trips ?? 0),
      avgTripsPerUser: Number(Number(e?.avg_trips ?? 0).toFixed(2)),
      avgActivitiesPerTrip: Number(Number(e?.avg_acts ?? 0).toFixed(2)),
    },
    tripsByMonth,
    topCities: citiesRes.rows.map((r) => ({
      name: r.name,
      country: r.country,
      stop_count: Number(r.stop_count),
    })),
    topActivities: actsRes.rows.map((r) => ({
      name: r.name,
      type: r.type,
      use_count: Number(r.use_count),
    })),
    recentUsers: usersRes.rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      role: r.role,
      created_at: String(r.created_at).slice(0, 10),
      trip_count: Number(r.trip_count),
    })),
  };
}
