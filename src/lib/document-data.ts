import { executeSqlResult, queryRows } from "@/lib/db";
import { publicAssetPath } from "@/lib/legacy-paths";

export type DownloadCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count: number;
};

export type DownloadDocument = {
  id: number;
  title: string;
  description: string;
  content?: string;
  categoryId?: number;
  categoryName: string;
  categorySlug?: string;
  fiscalYear?: string;
  department: string;
  responsiblePerson?: string;
  filePath?: string;
  fileUrl?: string;
  fileType: string;
  fileSizeKb?: number;
  serviceTarget?: string;
  tags?: string;
  downloadCount: number;
  publicStatus: string;
  itaRelated: boolean;
  itaCode?: string;
  publishedAt?: string;
  updatedAt?: string;
  isFeatured: boolean;
  sortOrder: number;
};

export type DownloadCenterData = {
  documents: DownloadDocument[];
  categories: DownloadCategory[];
  departments: string[];
  fileTypes: string[];
  popular: DownloadDocument[];
  stats: {
    totalDocuments: number;
    totalCategories: number;
    totalDownloads: number;
    monthDownloads: number;
    featuredDocuments: number;
  };
};

type RawDate = string | Date | null;

type RawDownloadDocument = {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  fiscal_year: string | null;
  department: string | null;
  responsible_person: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  service_target: string | null;
  tags: string | null;
  download_count: number | null;
  public_status: string;
  ita_related: number | null;
  ita_code: string | null;
  published_at: RawDate;
  updated_at: RawDate;
  is_featured: number | null;
  sort_order: number | null;
};

type RawDownloadCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  document_count: number | null;
};

const fallbackDocuments: DownloadDocument[] = [
  {
    id: 1,
    title: "แบบฟอร์มคำร้องทั่วไป",
    description: "แบบฟอร์มสำหรับยื่นคำร้องด้านทะเบียนและบริการนักเรียน นักศึกษา",
    categoryId: 5,
    categoryName: "เอกสารนักเรียน",
    categorySlug: "student-documents",
    fiscalYear: "2569",
    department: "งานทะเบียน",
    responsiblePerson: "เจ้าหน้าที่งานทะเบียน",
    filePath: "/uploads/documents/sample.pdf",
    fileUrl: publicAssetPath("/uploads/documents/sample.pdf"),
    fileType: "PDF",
    fileSizeKb: 0,
    serviceTarget: "นักเรียน นักศึกษา",
    tags: "คำร้อง, งานทะเบียน, แบบฟอร์ม",
    downloadCount: 0,
    publicStatus: "published",
    itaRelated: false,
    publishedAt: "2026-06-16",
    updatedAt: "2026-06-17",
    isFeatured: true,
    sortOrder: 1,
  },
];

const fallbackCategories: DownloadCategory[] = [
  { id: 5, name: "เอกสารนักเรียน", slug: "student-documents", count: 1 },
  { id: 6, name: "คู่มือการให้บริการ", slug: "service-manual", count: 0 },
  { id: 8, name: "รายงานงบประมาณ", slug: "budget-reports", count: 0 },
];

function normalizeDate(value: RawDate): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function normalizeFileType(value?: string | null): string {
  return String(value ?? "PDF").trim().toUpperCase() || "PDF";
}

function mapDownloadDocument(row: RawDownloadDocument): DownloadDocument {
  const filePath = row.file_path ?? undefined;

  return {
    id: Number(row.id),
    title: row.title,
    description: row.description ?? "",
    content: row.content ?? undefined,
    categoryId: row.category_id ?? undefined,
    categoryName: row.category_name ?? "เอกสารทั่วไป",
    categorySlug: row.category_slug ?? undefined,
    fiscalYear: row.fiscal_year ?? undefined,
    department: row.department ?? "หน่วยงานเจ้าของเอกสาร",
    responsiblePerson: row.responsible_person ?? undefined,
    filePath,
    fileUrl: publicAssetPath(filePath),
    fileType: normalizeFileType(row.file_type),
    fileSizeKb: row.file_size === null || row.file_size === undefined ? undefined : Number(row.file_size),
    serviceTarget: row.service_target ?? undefined,
    tags: row.tags ?? undefined,
    downloadCount: Number(row.download_count ?? 0),
    publicStatus: row.public_status,
    itaRelated: Boolean(Number(row.ita_related ?? 0)),
    itaCode: row.ita_code ?? undefined,
    publishedAt: normalizeDate(row.published_at),
    updatedAt: normalizeDate(row.updated_at),
    isFeatured: Boolean(Number(row.is_featured ?? 0)),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function buildStats(
  documents: DownloadDocument[],
  categories: DownloadCategory[],
  monthDownloads: number
): DownloadCenterData["stats"] {
  return {
    totalDocuments: documents.length,
    totalCategories: categories.length,
    totalDownloads: documents.reduce((sum, item) => sum + item.downloadCount, 0),
    monthDownloads,
    featuredDocuments: documents.filter((item) => item.isFeatured).length,
  };
}

export async function getDownloadDocuments(limit = 200): Promise<DownloadDocument[]> {
  const rows = await queryRows<RawDownloadDocument>(
    `SELECT d.id, d.title, d.description, d.content, d.category_id,
            c.name AS category_name, c.slug AS category_slug,
            d.fiscal_year, d.department, d.responsible_person,
            d.file_path, d.file_type, d.file_size, d.service_target, d.tags,
            d.download_count, d.public_status, d.ita_related, d.ita_code,
            d.published_at, d.updated_at, d.is_featured, d.sort_order
     FROM documents d
     LEFT JOIN categories c ON c.id = d.category_id
     WHERE d.public_status = 'published'
     ORDER BY d.is_featured DESC, d.sort_order ASC, d.download_count DESC, COALESCE(d.published_at, d.updated_at) DESC, d.id DESC
     LIMIT ?`,
    [limit]
  );

  return rows?.length ? rows.map(mapDownloadDocument) : fallbackDocuments;
}

export async function getDownloadDocument(id: number): Promise<DownloadDocument | null> {
  const rows = await queryRows<RawDownloadDocument>(
    `SELECT d.id, d.title, d.description, d.content, d.category_id,
            c.name AS category_name, c.slug AS category_slug,
            d.fiscal_year, d.department, d.responsible_person,
            d.file_path, d.file_type, d.file_size, d.service_target, d.tags,
            d.download_count, d.public_status, d.ita_related, d.ita_code,
            d.published_at, d.updated_at, d.is_featured, d.sort_order
     FROM documents d
     LEFT JOIN categories c ON c.id = d.category_id
     WHERE d.public_status = 'published' AND d.id = ?
     LIMIT 1`,
    [id]
  );

  return rows?.[0] ? mapDownloadDocument(rows[0]) : null;
}

export async function getDownloadCategories(): Promise<DownloadCategory[]> {
  const rows = await queryRows<RawDownloadCategory>(
    `SELECT c.id, c.name, c.slug, c.description, COUNT(d.id) AS document_count
     FROM categories c
     LEFT JOIN documents d ON d.category_id = c.id AND d.public_status = 'published'
     WHERE c.type = 'document' AND c.status = 'active'
     GROUP BY c.id, c.name, c.slug, c.description
     ORDER BY c.sort_order, c.id`
  );

  return rows?.length
    ? rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        slug: row.slug,
        description: row.description ?? undefined,
        count: Number(row.document_count ?? 0),
      }))
    : fallbackCategories;
}

export async function getMonthDownloadCount(): Promise<number> {
  const rows = await queryRows<{ total: number }>(
    `SELECT COUNT(*) AS total
     FROM document_download_logs
     WHERE created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')`
  );

  return Number(rows?.[0]?.total ?? 0);
}

export async function getDownloadCenterData(): Promise<DownloadCenterData> {
  const [documents, categories, monthDownloads] = await Promise.all([
    getDownloadDocuments(),
    getDownloadCategories(),
    getMonthDownloadCount(),
  ]);
  const departments = Array.from(new Set(documents.map((item) => item.department).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "th")
  );
  const fileTypes = Array.from(new Set(documents.map((item) => item.fileType))).sort();
  const popular = [...documents]
    .sort((a, b) => b.downloadCount - a.downloadCount || a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "th"))
    .slice(0, 5);

  return {
    documents,
    categories,
    departments,
    fileTypes,
    popular,
    stats: buildStats(documents, categories, monthDownloads),
  };
}

export async function incrementDocumentDownload(documentId: number, request?: Request): Promise<boolean> {
  const updated = await executeSqlResult(
    "UPDATE documents SET download_count = download_count + 1, updated_at = COALESCE(updated_at, NOW()) WHERE id = ? AND public_status = 'published'",
    [documentId]
  );

  if (!updated || updated.affectedRows === 0) {
    return false;
  }

  const userAgent = request?.headers.get("user-agent")?.slice(0, 255) ?? null;
  await executeSqlResult("INSERT INTO document_download_logs (document_id, user_agent, created_at) VALUES (?, ?, NOW())", [
    documentId,
    userAgent,
  ]);

  return true;
}
