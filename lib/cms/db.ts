import { Pool } from "pg";
import { hashPassword } from "./security";

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;
let schemaReady = false;

function getPool() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  return pool;
}

export async function query<T = unknown>(text: string, params: unknown[] = []) {
  const db = getPool();
  return db.query<T>(text, params);
}

export async function ensureCmsSchema() {
  if (schemaReady) {
    return;
  }

  await query(`
    CREATE TABLE IF NOT EXISTS cms_users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('super_admin', 'regional_admin')),
      region TEXT NOT NULL CHECK (region IN ('national', 'northern', 'central', 'southern', 'eastern')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS cms_sessions (
      id SERIAL PRIMARY KEY,
      token_hash TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES cms_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS cms_content (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'news')),
      category TEXT NOT NULL CHECK (category IN ('news', 'impact', 'press_release')),
      level TEXT NOT NULL CHECK (level IN ('national', 'regional')),
      region TEXT NULL CHECK (region IN ('northern', 'central', 'southern', 'eastern')),
      body TEXT NOT NULL DEFAULT '',
      created_by INTEGER NOT NULL REFERENCES cms_users(id) ON DELETE RESTRICT,
      updated_by INTEGER NOT NULL REFERENCES cms_users(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT cms_content_level_region_chk
      CHECK (
        (level = 'national' AND region IS NULL) OR
        (level = 'regional' AND region IS NOT NULL)
      )
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_cms_content_scope ON cms_content(level, region, content_type, category);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_cms_sessions_user_id ON cms_sessions(user_id);
  `);

  await ensureBootstrapAdmin();
  schemaReady = true;
}

async function ensureBootstrapAdmin() {
  const email = process.env.CMS_SUPERADMIN_EMAIL;
  const password = process.env.CMS_SUPERADMIN_PASSWORD;
  const name = process.env.CMS_SUPERADMIN_NAME ?? "CMS Super Admin";

  if (!email || !password) {
    return;
  }

  const passwordHash = hashPassword(password);
  await query(
    `
      INSERT INTO cms_users (name, email, password_hash, role, region)
      VALUES ($1, $2, $3, 'super_admin', 'national')
      ON CONFLICT (email) DO NOTHING
    `,
    [name, email.toLowerCase().trim(), passwordHash]
  );
}

