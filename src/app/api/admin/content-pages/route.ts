import { NextResponse } from "next/server";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { executeSqlResult, queryRows } from "@/lib/db";
import { canAccess } from "@/lib/permissions";

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

async function makeUniqueSlug(baseSlug: string): Promise<string> {
  let candidate = baseSlug;

  for (let suffix = 2; suffix < 200; suffix += 1) {
    const duplicate = await queryRows<{ id: number }>(
      "SELECT id FROM content_pages WHERE slug = ? LIMIT 1",
      [candidate]
    );

    if (!duplicate?.length) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

function normalizeStatus(value: unknown): string {
  const status = String(value ?? "published").trim();
  return allowedStatuses.has(status) ? status : "published";
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

export async function POST(request: Request) {
  const access = await requireContentPageAccess();

  if (access.error) {
    return access.error;
  }

  if (!access.user) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์จัดการหน้าเนื้อหา" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const title = String(payload?.title ?? "").trim();
  const slug = await makeUniqueSlug(normalizeSlug(String(payload?.slug ?? ""), title));
  const summary = String(payload?.summary ?? "").trim();
  const body = String(payload?.body ?? "").trim();
  const contentType = String(payload?.contentType ?? "general").trim() || "general";
  const coverImage = String(payload?.coverImage ?? "").trim() || null;
  const attachmentPath = String(payload?.attachmentPath ?? "").trim() || null;
  const sourceUrl = String(payload?.sourceUrl ?? "").trim() || null;
  const navKey = String(payload?.navKey ?? "").trim() || null;
  const status = normalizeStatus(payload?.status);

  if (!title) {
    return NextResponse.json({ message: "กรุณาระบุหัวข้อ" }, { status: 400 });
  }

  const created = await executeSqlResult(
    `INSERT INTO content_pages (slug, title, summary, body, content_type, cover_image, attachment_path, source_url, nav_key, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [slug, title, summary, body, contentType, coverImage, attachmentPath, sourceUrl, navKey, status]
  );

  if (!created) {
    return NextResponse.json({ message: "ยังสร้างหน้าเนื้อหาไม่ได้" }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    page: {
      id: created.insertId,
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
