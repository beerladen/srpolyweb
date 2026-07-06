import { NextResponse } from "next/server";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { executeSqlResult, queryRows } from "@/lib/db";
import { canAccess } from "@/lib/permissions";

type RawContentPage = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  content_type: string | null;
  cover_image: string | null;
  attachment_path: string | null;
  source_url: string | null;
  nav_key: string | null;
  status: string;
};

const allowedStatuses = new Set(["published", "draft", "review", "archived"]);

function normalizeSlug(value: string, fallback: string): string {
  const source = value.trim() || fallback.trim() || `page-${Date.now()}`;
  const slug = source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150)
    .replace(/-+$/g, "");

  return slug || `page-${Date.now()}`;
}

function normalizeStatus(value: unknown, fallback: string): string {
  const status = String(value ?? fallback).trim();
  return allowedStatuses.has(status) ? status : fallback;
}

function mapPage(row: RawContentPage) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    body: row.body ?? "",
    contentType: row.content_type ?? undefined,
    coverImage: row.cover_image ?? undefined,
    attachmentPath: row.attachment_path ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    navKey: row.nav_key ?? undefined,
    status: row.status,
    href: `/content/${row.slug}`,
  };
}

async function requireContentPageAccess() {
  const user = await getSignedInAdminUser();

  if (!user) {
    return { error: NextResponse.json({ message: "กรุณาเข้าสู่ระบบใหม่" }, { status: 401 }) };
  }

  if (!canAccess(user.effectivePermissions, "content_pages")) {
    return { error: NextResponse.json({ message: "ไม่มีสิทธิ์จัดการหน้าเนื้อหา" }, { status: 403 }) };
  }

  return { user };
}

async function getPageById(pageId: number): Promise<RawContentPage | null> {
  const rows = await queryRows<RawContentPage>(
    "SELECT id, slug, title, summary, body, content_type, cover_image, attachment_path, source_url, nav_key, status FROM content_pages WHERE id = ? LIMIT 1",
    [pageId]
  );

  return rows?.[0] ?? null;
}

async function readPageId(params: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await params;
  const pageId = Number(id);

  if (!Number.isInteger(pageId) || pageId <= 0) {
    return null;
  }

  return pageId;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireContentPageAccess();

  if (access.error) {
    return access.error;
  }

  if (!access.user) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์จัดการหน้าเนื้อหา" }, { status: 403 });
  }

  const pageId = await readPageId(params);

  if (!pageId) {
    return NextResponse.json({ message: "ไม่พบหน้าเนื้อหา" }, { status: 400 });
  }

  const page = await getPageById(pageId);

  if (!page) {
    return NextResponse.json({ message: "ไม่พบหน้าเนื้อหา" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, page: mapPage(page) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireContentPageAccess();

  if (access.error) {
    return access.error;
  }

  if (!access.user) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์จัดการหน้าเนื้อหา" }, { status: 403 });
  }

  const pageId = await readPageId(params);

  if (!pageId) {
    return NextResponse.json({ message: "ไม่พบหน้าเนื้อหา" }, { status: 400 });
  }

  const existing = await getPageById(pageId);

  if (!existing) {
    return NextResponse.json({ message: "ไม่พบหน้าเนื้อหา" }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  const title = String(payload?.title ?? existing.title).trim();
  const slug = normalizeSlug(String(payload?.slug ?? existing.slug), existing.slug);
  const summary = String(payload?.summary ?? existing.summary ?? "").trim();
  const body = String(payload?.body ?? existing.body ?? "").trim();
  const contentType = String(payload?.contentType ?? existing.content_type ?? "general").trim() || "general";
  const coverImage = String(payload?.coverImage ?? existing.cover_image ?? "").trim() || null;
  const attachmentPath = String(payload?.attachmentPath ?? existing.attachment_path ?? "").trim() || null;
  const sourceUrl = String(payload?.sourceUrl ?? existing.source_url ?? "").trim() || null;
  const navKey = String(payload?.navKey ?? existing.nav_key ?? "").trim() || null;
  const status = normalizeStatus(payload?.status, existing.status);

  if (!title) {
    return NextResponse.json({ message: "กรุณาระบุหัวข้อ" }, { status: 400 });
  }

  const duplicate = await queryRows<{ id: number }>(
    "SELECT id FROM content_pages WHERE slug = ? AND id <> ? LIMIT 1",
    [slug, pageId]
  );

  if (duplicate?.length) {
    return NextResponse.json({ message: "slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน URL" }, { status: 409 });
  }

  const saved = await executeSqlResult(
    "UPDATE content_pages SET slug = ?, title = ?, summary = ?, body = ?, content_type = ?, cover_image = ?, attachment_path = ?, source_url = ?, nav_key = ?, status = ?, updated_at = NOW() WHERE id = ?",
    [slug, title, summary, body, contentType, coverImage, attachmentPath, sourceUrl, navKey, status, pageId]
  );

  if (!saved) {
    return NextResponse.json({ message: "ยังบันทึกข้อมูลไม่ได้" }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    page: {
      id: pageId,
      slug,
      title,
      summary,
      body,
      contentType,
      coverImage: coverImage ?? undefined,
      attachmentPath: attachmentPath ?? undefined,
      sourceUrl: sourceUrl ?? undefined,
      navKey: navKey ?? undefined,
      status,
      href: `/content/${slug}`,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireContentPageAccess();

  if (access.error) {
    return access.error;
  }

  if (!access.user) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์จัดการหน้าเนื้อหา" }, { status: 403 });
  }

  const pageId = await readPageId(params);

  if (!pageId) {
    return NextResponse.json({ message: "ไม่พบหน้าเนื้อหา" }, { status: 400 });
  }

  const deleted = await executeSqlResult("DELETE FROM content_pages WHERE id = ?", [pageId]);

  if (!deleted) {
    return NextResponse.json({ message: "ยังลบหน้าเนื้อหาไม่ได้" }, { status: 503 });
  }

  if (deleted.affectedRows === 0) {
    return NextResponse.json({ message: "ไม่พบหน้าเนื้อหา" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
