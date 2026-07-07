import { executeSqlResult, queryRows } from "@/lib/db";
import { publicAssetPath } from "@/lib/legacy-paths";
import { fileNameFromPath, inferFileType } from "@/lib/media-fields";

export type PlanReportType = "แผนพัฒนา" | "แผนปฏิบัติการ" | "รายงานอื่น";

export type PlanDocument = {
  id: number;
  title: string;
  summary?: string;
  content?: string;
  reportType: PlanReportType;
  rawReportType: string;
  fiscalYear?: string;
  department: string;
  filePath?: string;
  fileUrl?: string;
  downloadUrl: string;
  fileName?: string;
  fileType: string;
  downloadCount: number;
  status: string;
  publishedAt?: string;
  updatedAt?: string;
  href: string;
  yearScore: number;
  isCurrent: boolean;
};

export type PlanCenterData = {
  documents: PlanDocument[];
  currentDocuments: PlanDocument[];
  developmentPlans: PlanDocument[];
  actionPlans: PlanDocument[];
  otherReports: PlanDocument[];
  years: string[];
  stats: {
    totalDocuments: number;
    totalDownloads: number;
    currentDocuments: number;
    latestYear?: string;
  };
};

type RawDate = string | Date | null;

type RawPlanDocument = {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  report_type: string | null;
  fiscal_year: string | null;
  department: string | null;
  file_path: string | null;
  download_count: number | null;
  status: string;
  published_at: RawDate;
  updated_at: RawDate;
};

const fallbackPlans: PlanDocument[] = [
  {
    id: 1,
    title: "แผนพัฒนาสถานศึกษา พ.ศ. 2569-2572",
    summary: "แผนพัฒนาสถานศึกษาระยะ 4 ปี สำหรับกำหนดทิศทาง เป้าหมาย และตัวชี้วัดของวิทยาลัย",
    reportType: "แผนพัฒนา",
    rawReportType: "แผนพัฒนา",
    fiscalYear: "2569-2572",
    department: "งานแผนและงบประมาณ",
    filePath: "/uploads/documents/sample.pdf",
    fileUrl: publicAssetPath("/uploads/documents/sample.pdf"),
    downloadUrl: "/api/plans/1/download",
    fileName: "sample.pdf",
    fileType: "PDF",
    downloadCount: 0,
    status: "published",
    publishedAt: "2026-06-17",
    updatedAt: "2026-06-17",
    href: "/plans/1",
    yearScore: 2572,
    isCurrent: true,
  },
  {
    id: 2,
    title: "แผนปฏิบัติการประจำปีงบประมาณ 2569",
    summary: "แผนปฏิบัติการประจำปีที่ใช้กำกับโครงการ งบประมาณ และการติดตามผลการดำเนินงาน",
    reportType: "แผนปฏิบัติการ",
    rawReportType: "แผนปฏิบัติการ",
    fiscalYear: "2569",
    department: "งานแผนและงบประมาณ",
    filePath: "/uploads/documents/sample.pdf",
    fileUrl: publicAssetPath("/uploads/documents/sample.pdf"),
    downloadUrl: "/api/plans/2/download",
    fileName: "sample.pdf",
    fileType: "PDF",
    downloadCount: 0,
    status: "published",
    publishedAt: "2026-06-16",
    updatedAt: "2026-06-17",
    href: "/plans/2",
    yearScore: 2569,
    isCurrent: true,
  },
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

export function normalizePlanReportType(value?: string | null): PlanReportType {
  const text = String(value ?? "").trim();

  if (text.includes("พัฒนา")) {
    return "แผนพัฒนา";
  }

  if (text.includes("ปฏิบัติ")) {
    return "แผนปฏิบัติการ";
  }

  return "รายงานอื่น";
}

export function planTypeSlug(type: PlanReportType): "development" | "action" | "other" {
  if (type === "แผนพัฒนา") {
    return "development";
  }

  if (type === "แผนปฏิบัติการ") {
    return "action";
  }

  return "other";
}

function yearScore(value?: string | null): number {
  const years = String(value ?? "")
    .match(/\d{4}/g)
    ?.map((year) => Number(year))
    .filter((year) => Number.isFinite(year)) ?? [];

  return years.length ? Math.max(...years) : 0;
}

function comparePlanDocuments(a: PlanDocument, b: PlanDocument): number {
  const typeWeight = (item: PlanDocument) => (item.reportType === "แผนพัฒนา" ? 0 : item.reportType === "แผนปฏิบัติการ" ? 1 : 2);

  return (
    typeWeight(a) - typeWeight(b) ||
    b.yearScore - a.yearScore ||
    String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")) ||
    b.id - a.id
  );
}

function markCurrentDocuments(documents: PlanDocument[]): PlanDocument[] {
  const currentByType = new Map<PlanReportType, number>();

  for (const type of ["แผนพัฒนา", "แผนปฏิบัติการ"] as const) {
    const latest = documents.filter((item) => item.reportType === type).sort(comparePlanDocuments)[0];

    if (latest) {
      currentByType.set(type, latest.id);
    }
  }

  return documents.map((document) => ({
    ...document,
    isCurrent: currentByType.get(document.reportType) === document.id,
  }));
}

function mapPlanDocument(row: RawPlanDocument): PlanDocument {
  const filePath = row.file_path ?? undefined;
  const reportType = normalizePlanReportType(row.report_type);

  return {
    id: Number(row.id),
    title: row.title,
    summary: row.summary ?? undefined,
    content: row.content ?? undefined,
    reportType,
    rawReportType: row.report_type ?? reportType,
    fiscalYear: row.fiscal_year ?? undefined,
    department: row.department ?? "งานแผนและงบประมาณ",
    filePath,
    fileUrl: publicAssetPath(filePath),
    downloadUrl: `/api/plans/${row.id}/download`,
    fileName: filePath ? fileNameFromPath(filePath) : undefined,
    fileType: inferFileType(filePath, "PDF"),
    downloadCount: Number(row.download_count ?? 0),
    status: row.status,
    publishedAt: normalizeDate(row.published_at),
    updatedAt: normalizeDate(row.updated_at),
    href: `/plans/${row.id}`,
    yearScore: yearScore(row.fiscal_year),
    isCurrent: false,
  };
}

function buildPlanCenterData(documents: PlanDocument[]): PlanCenterData {
  const sortedDocuments = markCurrentDocuments([...documents].sort(comparePlanDocuments));
  const currentDocuments = sortedDocuments.filter((document) => document.isCurrent);
  const years = Array.from(new Set(sortedDocuments.map((document) => document.fiscalYear).filter(Boolean) as string[]));

  return {
    documents: sortedDocuments,
    currentDocuments,
    developmentPlans: sortedDocuments.filter((document) => document.reportType === "แผนพัฒนา"),
    actionPlans: sortedDocuments.filter((document) => document.reportType === "แผนปฏิบัติการ"),
    otherReports: sortedDocuments.filter((document) => document.reportType === "รายงานอื่น"),
    years,
    stats: {
      totalDocuments: sortedDocuments.length,
      totalDownloads: sortedDocuments.reduce((sum, item) => sum + item.downloadCount, 0),
      currentDocuments: currentDocuments.length,
      latestYear: years[0],
    },
  };
}

export async function getPlanCenterData(): Promise<PlanCenterData> {
  const rows = await queryRows<RawPlanDocument>(
    `SELECT id, title, summary, content, report_type, fiscal_year, department, file_path,
            download_count, status, published_at, updated_at
     FROM plans_reports
     WHERE status = 'published'
     ORDER BY COALESCE(published_at, updated_at) DESC, id DESC`
  );

  return buildPlanCenterData(rows?.length ? rows.map(mapPlanDocument) : fallbackPlans);
}

export async function getPlanDocument(id: number): Promise<PlanDocument | null> {
  const rows = await queryRows<RawPlanDocument>(
    `SELECT id, title, summary, content, report_type, fiscal_year, department, file_path,
            download_count, status, published_at, updated_at
     FROM plans_reports
     WHERE id = ? AND status = 'published'
     LIMIT 1`,
    [id]
  );

  return rows?.[0] ? markCurrentDocuments([mapPlanDocument(rows[0])])[0] : null;
}

export async function incrementPlanDownload(id: number): Promise<boolean> {
  const result = await executeSqlResult(
    "UPDATE plans_reports SET download_count = COALESCE(download_count, 0) + 1, updated_at = NOW() WHERE id = ? AND status = 'published'",
    [id]
  );

  return Boolean(result?.affectedRows);
}
