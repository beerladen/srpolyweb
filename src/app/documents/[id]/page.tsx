import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  FolderOpen,
  UserRound,
} from "lucide-react";
import { AdminCrudTools } from "@/components/public/admin-crud-tools";
import { SiteShell } from "@/components/public/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRow } from "@/lib/admin-crud-server";
import { withBasePath } from "@/lib/base-path";
import { getDownloadDocument } from "@/lib/document-data";
import { getSiteOverview } from "@/lib/site-data";

const fileTypeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  DOC: FileType2,
  DOCX: FileType2,
  XLS: FileSpreadsheet,
  XLSX: FileSpreadsheet,
  PPT: FileType2,
  PPTX: FileType2,
  ZIP: FileArchive,
  IMAGE: FileImage,
};

function formatDate(value?: string): string {
  return value ? value.slice(0, 10) : "ยังไม่ระบุ";
}

function formatNumber(value: number): string {
  return value.toLocaleString("th-TH");
}

function formatFileSize(value?: number): string {
  if (!value) {
    return "ไม่ระบุ";
  }

  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)} MB`;
  }

  return `${formatNumber(value)} KB`;
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documentId = Number(id);

  if (!Number.isInteger(documentId) || documentId < 1) {
    notFound();
  }

  const [overview, adminUser, crudConfig, document] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("documents"),
    getDownloadDocument(documentId),
  ]);

  if (!document) {
    notFound();
  }

  const crudRow = crudConfig ? await getAdminCrudRow(crudConfig, document.id) : null;
  const Icon = fileTypeIcons[document.fileType] ?? FileText;

  return (
    <SiteShell active="documents" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 md:px-6">
        <Button asChild variant="ghost" className="w-fit">
          <Link href="/documents">
            <ArrowLeft data-icon="inline-start" />
            กลับหน้าดาวน์โหลดเอกสาร
          </Link>
        </Button>

        <Card className="border-blue-100 shadow-sm shadow-blue-950/5">
          <CardHeader className="gap-4 border-b border-blue-100">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{document.categoryName}</Badge>
                <Badge variant="outline">{document.department}</Badge>
                {document.isFeatured ? <Badge className="bg-amber-500">เอกสารแนะนำ</Badge> : null}
                {document.itaRelated && document.itaCode ? <Badge variant="outline">ITA {document.itaCode}</Badge> : null}
              </div>
              {crudConfig && crudRow ? (
                <AdminCrudTools
                  user={adminUser}
                  permission={crudConfig.permission}
                  moduleKey={crudConfig.key}
                  moduleLabel={crudConfig.label}
                  fields={crudConfig.fields}
                  row={crudRow}
                  label="จัดการเอกสารนี้"
                  adminHref={`/admin/modules/${crudConfig.key}`}
                  afterDeleteHref={`/admin/modules/${crudConfig.key}`}
                />
              ) : null}
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-start">
              <div>
                <CardTitle className="text-2xl leading-9 tracking-normal md:text-3xl">{document.title}</CardTitle>
                <p className="mt-3 text-base leading-7 text-slate-600">{document.description}</p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-sky-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-md bg-blue-700 text-white">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <strong className="block text-lg text-slate-950">{document.fileType}</strong>
                    <span className="text-sm text-slate-600">{formatFileSize(document.fileSizeKb)}</span>
                  </div>
                </div>
                <Button asChild className="mt-4 w-full">
                  <a href={withBasePath(`/api/documents/${document.id}/download`)} target="_blank" rel="noreferrer">
                    <Download data-icon="inline-start" />
                    ดาวน์โหลดเอกสาร
                  </a>
                </Button>
                <p className="mt-2 text-center text-xs text-slate-500">
                  ดาวน์โหลดแล้ว {formatNumber(document.downloadCount)} ครั้ง
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
            <div className="flex flex-col gap-4 text-sm leading-7 text-slate-700">
              {document.content ? (
                <div
                  className="[&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-7"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              ) : (
                <p>
                  เอกสารนี้ใช้สำหรับบริการของ {document.department} ผู้ใช้สามารถดาวน์โหลดไฟล์เพื่อนำไปกรอกข้อมูล
                  หรือใช้ประกอบการติดต่อฝ่ายงานที่เกี่ยวข้อง
                </p>
              )}
              {document.tags ? (
                <div className="flex flex-wrap gap-2">
                  {document.tags.split(",").map((tag) => (
                    <Badge key={tag.trim()} variant="outline">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <aside className="flex flex-col gap-3">
              <div className="rounded-lg border border-blue-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <FolderOpen className="mt-0.5 size-5 text-blue-700" />
                  <div>
                    <strong className="text-sm text-slate-950">หมวดเอกสาร</strong>
                    <p className="mt-1 text-sm text-slate-600">{document.categoryName}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-blue-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 size-5 text-blue-700" />
                  <div>
                    <strong className="text-sm text-slate-950">ผู้รับผิดชอบ</strong>
                    <p className="mt-1 text-sm text-slate-600">
                      {document.responsiblePerson ?? document.department}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-blue-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-5 text-blue-700" />
                  <div>
                    <strong className="text-sm text-slate-950">วันที่เผยแพร่</strong>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDate(document.publishedAt ?? document.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
