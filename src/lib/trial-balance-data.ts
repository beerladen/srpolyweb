import { executeSqlResult, queryRows } from "@/lib/db";
import { type DownloadCategory, type DownloadCenterData, type DownloadDocument } from "@/lib/document-data";
import { publicAssetPath } from "@/lib/legacy-paths";
import { inferFileType } from "@/lib/media-fields";

const trialBalanceType = "รายงานงบทดลอง";

type RawDate = string | Date | null;

type RawTrialBalanceReport = {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  type: string | null;
  fiscal_year: string | null;
  department: string | null;
  budget: string | number | null;
  file_path: string | null;
  download_count: number | null;
  status: string;
  published_at: RawDate;
  updated_at: RawDate;
};

function normalizeDate(value: RawDate): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function normalizeFileType(path?: string | null): string {
  const value = String(path ?? "").trim();

  if (!value) {
    return "FILE";
  }

  if ((value.startsWith("http://") || value.startsWith("https://")) && !/\.[a-z0-9]{2,5}($|\?)/i.test(value)) {
    return "LINK";
  }

  return inferFileType(value);
}

function yearCategory(year?: string): Pick<DownloadDocument, "categoryName" | "categorySlug"> {
  const cleanYear = String(year ?? "").trim();

  if (!cleanYear) {
    return { categoryName: "ไม่ระบุปีงบประมาณ", categorySlug: "year-unspecified" };
  }

  return { categoryName: `ปีงบประมาณ ${cleanYear}`, categorySlug: `year-${cleanYear}` };
}

function mapTrialBalanceReport(row: RawTrialBalanceReport): DownloadDocument {
  const category = yearCategory(row.fiscal_year ?? undefined);
  const filePath = row.file_path ?? undefined;

  return {
    id: Number(row.id),
    title: row.title,
    description: row.summary ?? `รายงานงบทดลอง${row.fiscal_year ? ` ปีงบประมาณ ${row.fiscal_year}` : ""}`,
    content: row.content ?? undefined,
    ...category,
    fiscalYear: row.fiscal_year ?? undefined,
    department: row.department ?? "งานการเงิน",
    responsiblePerson: row.department ?? "งานการเงิน",
    filePath,
    fileUrl: publicAssetPath(filePath),
    detailUrl: `/trial-balance/${row.id}`,
    downloadUrl: `/api/trial-balance/${row.id}/download`,
    fileType: normalizeFileType(filePath),
    serviceTarget: "นักเรียน นักศึกษา ผู้ปกครอง ประชาชน และผู้ตรวจสอบ",
    tags: [trialBalanceType, row.fiscal_year, row.department].filter(Boolean).join(", "),
    downloadCount: Number(row.download_count ?? 0),
    publicStatus: row.status,
    itaRelated: true,
    itaCode: "O10/O11",
    publishedAt: normalizeDate(row.published_at),
    updatedAt: normalizeDate(row.updated_at),
    isFeatured: false,
    sortOrder: 0,
  };
}

function buildCategories(documents: DownloadDocument[]): DownloadCategory[] {
  const categoriesBySlug = new Map<string, DownloadCategory>();

  for (const document of documents) {
    const slug = document.categorySlug ?? "year-unspecified";
    const current = categoriesBySlug.get(slug);

    categoriesBySlug.set(slug, {
      id: current?.id ?? categoriesBySlug.size + 1,
      name: current?.name ?? document.categoryName,
      slug,
      count: (current?.count ?? 0) + 1,
    });
  }

  return Array.from(categoriesBySlug.values()).sort((a, b) => b.slug.localeCompare(a.slug, "th"));
}

function buildStats(documents: DownloadDocument[], categories: DownloadCategory[], monthDownloads: number) {
  return {
    totalDocuments: documents.length,
    totalCategories: categories.length,
    totalDownloads: documents.reduce((sum, item) => sum + item.downloadCount, 0),
    monthDownloads,
    featuredDocuments: documents.filter((item) => item.isFeatured).length,
  };
}

export async function getTrialBalanceReports(limit = 300): Promise<DownloadDocument[]> {
  const safeLimit = Math.max(1, Math.min(500, Math.floor(Number.isFinite(limit) ? limit : 300)));
  const rows = await queryRows<RawTrialBalanceReport>(
    `SELECT id, title, summary, content, type, fiscal_year, department, budget, file_path,
            download_count, status, published_at, updated_at
     FROM procurement
     WHERE status = 'published' AND type = ?
     ORDER BY fiscal_year DESC, COALESCE(published_at, updated_at) DESC, id DESC
     LIMIT ${safeLimit}`,
    [trialBalanceType]
  );

  return rows?.map(mapTrialBalanceReport) ?? [];
}

export async function getTrialBalanceReport(id: number): Promise<DownloadDocument | null> {
  const rows = await queryRows<RawTrialBalanceReport>(
    `SELECT id, title, summary, content, type, fiscal_year, department, budget, file_path,
            download_count, status, published_at, updated_at
     FROM procurement
     WHERE status = 'published' AND type = ? AND id = ?
     LIMIT 1`,
    [trialBalanceType, id]
  );

  return rows?.[0] ? mapTrialBalanceReport(rows[0]) : null;
}

export async function getTrialBalanceMonthDownloadCount(): Promise<number> {
  const rows = await queryRows<{ total: number }>(
    `SELECT COUNT(*) AS total
     FROM trial_balance_download_logs
     WHERE created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')`
  );

  return Number(rows?.[0]?.total ?? 0);
}

export async function getTrialBalanceData(): Promise<DownloadCenterData> {
  const [documents, monthDownloads] = await Promise.all([
    getTrialBalanceReports(),
    getTrialBalanceMonthDownloadCount(),
  ]);
  const categories = buildCategories(documents);
  const departments = Array.from(new Set(documents.map((item) => item.department).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "th")
  );
  const fileTypes = Array.from(new Set(documents.map((item) => item.fileType))).sort();
  const popular = [...documents]
    .sort((a, b) => b.downloadCount - a.downloadCount || b.title.localeCompare(a.title, "th"))
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

export async function incrementTrialBalanceDownload(reportId: number, request?: Request): Promise<boolean> {
  const updated = await executeSqlResult(
    "UPDATE procurement SET download_count = COALESCE(download_count, 0) + 1, updated_at = NOW() WHERE id = ? AND status = 'published' AND type = ?",
    [reportId, trialBalanceType]
  );

  if (!updated || updated.affectedRows === 0) {
    return false;
  }

  const userAgent = request?.headers.get("user-agent")?.slice(0, 255) ?? null;
  await executeSqlResult("INSERT INTO trial_balance_download_logs (report_id, user_agent, created_at) VALUES (?, ?, NOW())", [
    reportId,
    userAgent,
  ]);

  return true;
}
