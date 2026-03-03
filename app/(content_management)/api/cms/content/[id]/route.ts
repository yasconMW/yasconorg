import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/cms/auth";
import {
  CMS_CATEGORIES,
  CMS_CONTENT_TYPES,
  CMS_LEVELS,
  CMS_REGIONS,
  type CmsCategory,
  type CmsContentType,
  type CmsLevel,
  type CmsRegion,
} from "@/lib/cms/constants";
import { ensureCmsSchema, query } from "@/lib/cms/db";
import {
  canAccessContentScope,
  getForcedScopeForUser,
  isSuperAdmin,
} from "@/lib/cms/permissions";

type ContentRow = {
  id: number;
  title: string;
  slug: string;
  content_type: CmsContentType;
  category: CmsCategory;
  level: CmsLevel;
  region: CmsRegion | null;
  body: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
};

function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function getContentById(id: number) {
  const result = await query<ContentRow>(
    `
      SELECT
        id, title, slug, content_type, category, level, region, body,
        created_at, updated_at, created_by, updated_by
      FROM cms_content
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
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureCmsSchema();

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const existing = await getContentById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!canAccessContentScope(user, { level: existing.level, region: existing.region })) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await req.json()) as {
    title?: string;
    slug?: string;
    contentType?: CmsContentType;
    category?: CmsCategory;
    level?: CmsLevel;
    region?: CmsRegion | null;
    body?: string;
  };

  const forced = getForcedScopeForUser(user);
  const nextLevel = forced?.level ?? body.level ?? existing.level;
  const nextRegion =
    forced?.region ??
    (body.region === undefined ? existing.region : body.region === "national" ? null : body.region);

  if (!CMS_LEVELS.includes(nextLevel)) {
    return NextResponse.json({ error: "Invalid level." }, { status: 400 });
  }
  if (nextLevel === "national" && !isSuperAdmin(user)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (nextLevel === "regional" && (!nextRegion || nextRegion === "national")) {
    return NextResponse.json({ error: "Region is required for regional level." }, { status: 400 });
  }
  if (nextRegion && !CMS_REGIONS.includes(nextRegion)) {
    return NextResponse.json({ error: "Invalid region." }, { status: 400 });
  }

  const nextTitle = body.title?.trim() || existing.title;
  const nextSlug = body.slug ? normalizeSlug(body.slug) : existing.slug;
  const nextContentType = body.contentType ?? existing.content_type;
  const nextCategory = body.category ?? existing.category;
  const nextBody = body.body ?? existing.body;

  if (!CMS_CONTENT_TYPES.includes(nextContentType)) {
    return NextResponse.json({ error: "Invalid content type." }, { status: 400 });
  }
  if (!CMS_CATEGORIES.includes(nextCategory)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }
  if (!nextSlug) {
    return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
  }

  try {
    const result = await query<ContentRow>(
      `
        UPDATE cms_content
        SET
          title = $1,
          slug = $2,
          content_type = $3,
          category = $4,
          level = $5,
          region = $6,
          body = $7,
          updated_by = $8,
          updated_at = NOW()
        WHERE id = $9
        RETURNING
          id, title, slug, content_type, category, level, region, body,
          created_at, updated_at, created_by, updated_by
      `,
      [
        nextTitle,
        nextSlug,
        nextContentType,
        nextCategory,
        nextLevel,
        nextRegion,
        nextBody,
        user.id,
        id,
      ]
    );
    return NextResponse.json({ item: result.rows[0] });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "Slug already exists."
        : "Failed to update content.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureCmsSchema();

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const existing = await getContentById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!canAccessContentScope(user, { level: existing.level, region: existing.region })) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await query(`DELETE FROM cms_content WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}

