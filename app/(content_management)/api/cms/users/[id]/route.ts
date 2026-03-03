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
import { canManageUsers } from "@/lib/cms/permissions";
import { hashPassword } from "@/lib/cms/security";

type UserRow = CmsUserRecord;

async function getUserById(id: number) {
  const result = await query<UserRow>(
    `
      SELECT id, name, email, role, region, created_at
      FROM cms_users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getSessionUserFromRequest(req);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageUsers(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await ensureCmsSchema();

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const existing = await getUserById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = (await req.json()) as {
    name?: string;
    role?: CmsRole;
    region?: CmsRegion;
    password?: string;
  };

  const name = body.name?.trim() || existing.name;
  const role = body.role ?? existing.role;
  const region = body.region ?? existing.region;

  if (!CMS_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  if (!CMS_REGIONS.includes(region)) {
    return NextResponse.json({ error: "Invalid region." }, { status: 400 });
  }
  if (role === "super_admin" && region !== "national") {
    return NextResponse.json(
      { error: "Super admin must be national." },
      { status: 400 }
    );
  }

  if (body.password?.trim()) {
    await query(
      `
        UPDATE cms_users
        SET name = $1, role = $2, region = $3, password_hash = $4
        WHERE id = $5
      `,
      [name, role, region, hashPassword(body.password), id]
    );
  } else {
    await query(
      `
        UPDATE cms_users
        SET name = $1, role = $2, region = $3
        WHERE id = $4
      `,
      [name, role, region, id]
    );
  }

  const updated = await getUserById(id);
  return NextResponse.json({ item: updated });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getSessionUserFromRequest(req);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageUsers(actor)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await ensureCmsSchema();

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  if (id === actor.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  await query(`DELETE FROM cms_users WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}

