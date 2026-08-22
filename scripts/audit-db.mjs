import pg from "pg";
import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
for (const line of env.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  const k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  if (!(k in process.env)) process.env[k] = v;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function q(label, sql, params = []) {
  try {
    const r = await pool.query(sql, params);
    console.log(`OK ${label}:`, JSON.stringify(r.rows));
  } catch (e) {
    console.log(`FAIL ${label}:`, e.message);
  }
}

await q(
  "orphan_stops",
  `SELECT COUNT(*)::int AS n FROM trip_stops s LEFT JOIN trips t ON t.id=s.trip_id WHERE t.id IS NULL`
);
await q(
  "orphan_trip_activities",
  `SELECT COUNT(*)::int AS n FROM trip_activities ta LEFT JOIN trip_stops s ON s.id=ta.stop_id WHERE s.id IS NULL`
);
await q(
  "orphan_costs",
  `SELECT COUNT(*)::int AS n FROM trip_costs c LEFT JOIN trips t ON t.id=c.trip_id WHERE t.id IS NULL`
);
await q(
  "cities",
  `SELECT COUNT(*)::int AS cities, COUNT(image_url)::int AS with_img, COUNT(description)::int AS with_desc FROM cities`
);
await q(
  "activities",
  `SELECT COUNT(*)::int AS activities, COUNT(DISTINCT city_id)::int AS cities_covered FROM activities`
);
await q(
  "demo_user",
  `SELECT email, role::text AS role, username FROM users WHERE email=$1`,
  ["demo@globetrotter.app"]
);
await q(
  "trip_counts",
  `SELECT COUNT(*)::int AS trips,
          COUNT(*) FILTER (WHERE is_public)::int AS public_trips,
          COUNT(*) FILTER (WHERE is_featured)::int AS featured,
          COUNT(*) FILTER (WHERE share_slug IS NOT NULL)::int AS with_slug
   FROM trips`
);
await q(
  "bad_trip_dates",
  `SELECT COUNT(*)::int AS n FROM trips WHERE end_date < start_date`
);
await q(
  "bad_stop_dates",
  `SELECT COUNT(*)::int AS n FROM trip_stops s
   JOIN trips t ON t.id=s.trip_id
   WHERE s.start_date < t.start_date OR s.end_date > t.end_date OR s.end_date < s.start_date`
);
await q(
  "demo_trips",
  `SELECT t.name,
          to_char(t.start_date,'YYYY-MM-DD') AS start,
          to_char(t.end_date,'YYYY-MM-DD') AS end,
          (SELECT COUNT(*)::int FROM trip_stops s WHERE s.trip_id=t.id) AS stops,
          (SELECT COUNT(*)::int FROM trip_activities ta JOIN trip_stops s ON s.id=ta.stop_id WHERE s.trip_id=t.id) AS acts,
          t.share_slug, t.is_public
   FROM trips t JOIN users u ON u.id=t.user_id
   WHERE u.email=$1
   ORDER BY t.created_at DESC LIMIT 8`,
  ["demo@globetrotter.app"]
);
await q(
  "saved_destinations",
  `SELECT COUNT(*)::int AS n FROM saved_destinations`
);
await q(
  "journeys_reviews",
  `SELECT (SELECT COUNT(*)::int FROM journeys) AS journeys,
          (SELECT COUNT(*)::int FROM reviews) AS reviews,
          (SELECT COUNT(*)::int FROM users WHERE role='ADMIN') AS admins`
);
await q(
  "public_share_sample",
  `SELECT share_slug, name FROM trips WHERE is_public=TRUE AND share_slug IS NOT NULL LIMIT 3`
);

await pool.end();
