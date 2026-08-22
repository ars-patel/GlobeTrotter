/**
 * Apply pending SQL in backend/migrations and backend/seeding (numeric order),
 * then move each successfully applied file into .../archived/.
 *
 * Usage: node scripts/db-apply.mjs
 *        npm run db:apply
 *
 * Requires DATABASE_URL in .env
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env not found. Copy .env.example to .env and set DATABASE_URL.");
  }
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function listSqlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql") && /^\d+_/.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function ensureArchived(dir) {
  const archived = path.join(dir, "archived");
  fs.mkdirSync(archived, { recursive: true });
  const keep = path.join(archived, ".gitkeep");
  if (!fs.existsSync(keep)) fs.writeFileSync(keep, "");
  return archived;
}

async function applyFolder(client, folderLabel, folderPath) {
  const archived = ensureArchived(folderPath);
  const files = listSqlFiles(folderPath);
  if (files.length === 0) {
    console.log(`[${folderLabel}] No pending .sql files.`);
    return { applied: 0, files: [] };
  }

  const applied = [];
  for (const file of files) {
    const full = path.join(folderPath, file);
    const sql = fs.readFileSync(full, "utf8");
    console.log(`[${folderLabel}] Applying ${file}…`);
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`[${folderLabel}] Failed on ${file}: ${err.message}`);
    }

    const dest = path.join(archived, file);
    if (fs.existsSync(dest)) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      fs.renameSync(full, path.join(archived, `${stamp}_${file}`));
    } else {
      fs.renameSync(full, dest);
    }
    console.log(`[${folderLabel}] Archived → ${path.relative(root, dest)}`);
    applied.push(file);
  }
  return { applied: applied.length, files: applied };
}

async function main() {
  loadEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env");
  }

  // Masked connection info for logs
  try {
    const u = new URL(connectionString);
    console.log(
      `Connecting to ${u.hostname}:${u.port || 5432}${u.pathname} as ${u.username}…`
    );
  } catch {
    console.log("Connecting with DATABASE_URL…");
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    const migrationsDir = path.join(root, "backend", "migrations");
    const seedingDir = path.join(root, "backend", "seeding");

    const mig = await applyFolder(client, "migrations", migrationsDir);
    const seed = await applyFolder(client, "seeding", seedingDir);

    console.log(
      `\nDone. Migrations applied: ${mig.applied}. Seeds applied: ${seed.applied}.`
    );
    if (mig.applied === 0 && seed.applied === 0) {
      console.log(
        "Nothing pending. Already-applied SQL lives under backend/*/archived/."
      );
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("\nERROR:", err.message);
  process.exit(1);
});
