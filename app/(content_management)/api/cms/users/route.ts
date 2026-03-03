import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/cms/auth";
import {
  CMS_REGIONS,
  CMS_ROLES,
  type CmsRegion,
  type CmsRole,
  type CmsUserRecord,
} from "@/lib/cms/constants";
import { ensureCmsSchema, query } from "@/lib/cms/db";
import { canManageUsers, canReadUserRecord } from "@/lib/cms/permissions";
import { hashPassword } from "@/lib/cms/security";

type UserRow = CmsUserRecord & {
  password_hash?: string;
};

export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureCmsSchema();

  const result = await query<UserRow>(
    `
      SELECT id, name, email, role, region, created_at
      FROM cms_users
      ORDER BY created_at DESC
    `
  );

  const items = result.rows.filter((row) =>
    canReadUserRecord(user, { role: row.role, region: row.region })
  );
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await ensureCmsSchema();

  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: CmsRole;
    region?: CmsRegion;
  };

  const name = body.name?.trim();
  const email = body.email?.toLowerCase().trim();
  const password = body.password;
  const role = body.role;
  const region = body.region;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 }
    );
  }
  if (!role || !CMS_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  if (!region || !CMS_REGIONS.includes(region)) {
    return NextResponse.json({ error: "Invalid region." }, { status: 400 });
  }
  if (role === "super_admin" && region !== "national") {
    return NextResponse.json(
      { error: "Super admin must be national." },
      { status: 400 }
    );
  }

  try {
    const result = await query<UserRow>(
      `
        INSERT INTO cms_users (name, email, password_hash, role, region)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role, region, created_at
      `,
      [name, email, hashPassword(password), role, region]
    );
    return NextResponse.json({ item: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "User could not be created. Email may already exist." },
      { status: 400 }
    );
  }
}

