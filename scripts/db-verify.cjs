const fs = require("fs");
const { Client } = require("pg");

for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  let value = t.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[t.slice(0, eq).trim()] = value;
}

const REQUIRED_TABLES = [
  "users",
  "cities",
  "activities",
  "trips",
  "trip_stops",
  "trip_activities",
  "trip_costs",
  "saved_destinations",
  "password_reset_tokens",
  "packing_suggestion_templates",
  "trip_packing_items",
  "community_posts",
  "app_settings",
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name`
  );
  const have = new Set(rows.map((r) => r.table_name));
  const missing = REQUIRED_TABLES.filter((t) => !have.has(t));
  console.log("tables:", [...have].join(", "));
  console.log("missing:", missing.length ? missing.join(", ") : "(none)");

  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'users' ORDER BY ordinal_position`
  );
  console.log(
    "users columns:",
    cols.rows.map((r) => r.column_name).join(", ")
  );

  const counts = await client.query(`
    SELECT 'cities' AS t, COUNT(*)::int AS n FROM cities
    UNION ALL SELECT 'activities', COUNT(*)::int FROM activities
    UNION ALL SELECT 'users', COUNT(*)::int FROM users
    UNION ALL SELECT 'packing_suggestion_templates', COUNT(*)::int FROM packing_suggestion_templates
    UNION ALL SELECT 'app_settings', COUNT(*)::int FROM app_settings
  `);
  for (const row of counts.rows) console.log(`count ${row.t}=${row.n}`);

  await client.end();
  if (missing.length) process.exit(2);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
