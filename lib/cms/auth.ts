import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CMS_SESSION_COOKIE, type CmsUserRecord } from "./constants";
import { ensureCmsSchema, query } from "./db";
import {
  generateSessionToken,
  hashSessionToken,
  verifyPassword,
} from "./security";

const SESSION_DAYS = 7;

type SessionUser = CmsUserRecord & {
  password_hash: string;
};

export async function authenticateUser(email: string, password: string) {
  await ensureCmsSchema();
  const normalizedEmail = email.toLowerCase().trim();

  const result = await query<SessionUser>(
    `
      SELECT id, name, email, role, region, password_hash, created_at
      FROM cms_users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizedEmail]
  );

  const user = result.rows[0];
  if (!user) {
    return null;
  }

  if (!verifyPassword(password, user.password_hash)) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    region: user.region,
    created_at: user.created_at,
  } satisfies CmsUserRecord;
}

export async function createSession(userId: number) {
  await ensureCmsSchema();
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `
      INSERT INTO cms_sessions (token_hash, user_id, expires_at)
      VALUES ($1, $2, $3)
    `,
    [tokenHash, userId, expiresAt.toISOString()]
  );

  return { token, expiresAt };
}

export async function invalidateSession(token: string) {
  await ensureCmsSchema();
  await query(`DELETE FROM cms_sessions WHERE token_hash = $1`, [
    hashSessionToken(token),
  ]);
}

export async function getSessionUserByToken(token: string) {
  await ensureCmsSchema();
  const tokenHash = hashSessionToken(token);

  const result = await query<CmsUserRecord>(
    `
      SELECT u.id, u.name, u.email, u.role, u.region, u.created_at
      FROM cms_sessions s
      INNER JOIN cms_users u ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function getSessionUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(CMS_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return getSessionUserByToken(token);
}

export async function getSessionUserFromCookieStore(
  cookieStore: { get(name: string): { value: string } | undefined }
) {
  const token = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return getSessionUserByToken(token);
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date
) {
  response.cookies.set(CMS_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(CMS_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
  return response;
}

export async function getCurrentDashboardUser() {
  const cookieStore = await cookies();
  return getSessionUserFromCookieStore(cookieStore);
}
