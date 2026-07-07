import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCrudTools } from "@/components/public/admin-crud-tools";
import { AdminInlineTools } from "@/components/public/admin-inline-tools";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRow } from "@/lib/admin-crud-server";
import { withBasePath } from "@/lib/base-path";
import { getPlanCenterData, getPlanDocument } from "@/lib/plan-data";
import { getSiteOverview, statusLabel, statusVariant } from "@/lib/site-data";

function displayDate(value?: string): string {
  return value ? value.slice(0, 10) : "ยังไม่ระบุวันที่";
}

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documentId = Number(id);

  if (!Number.isInteger(documentId) || documentId < 1) {
    notFound();
  }

  const [overview, adminUser, crudConfig, document, planData] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("plans"),
    getPlanDocument(documentId),
    getPlanCenterData(),
  ]);

  if (!document) {
    notFound();
  }

  const crudRow = crudConfig ? await getAdminCrudRow(crudConfig, document.id) : null;
  const relatedDocuments = planData.documents
    .filter((item) => item.id !== document.id && item.reportType === document.reportType)
    .slice(0, 3);

  return (
    <SiteShell active="plans" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
        <Button asChild variant="ghost" className="w-fit">
          <Link href="/plans">
            <ArrowLeft data-icon="inline-start" />
            กลับแผนและรายงาน
          </Link>
        </Button>

        <Card className="overflow-hidden border-blue-100 shadow-sm shadow-blue-950/5">
          <CardHeader className="gap-4 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_62%,#edf8ff_100%)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{document.reportType}</Badge>
                {document.fiscalYear ? <Badge variant="outline">ปี {document.fiscalYear}</Badge> : null}
                <Badge variant={statusVariant(document.status)}>{statusLabel(document.status)}</Badge>
              </div>
              {crudConfig && crudRow ? (
                <AdminCrudTools
                  user={adminUser}
                  permission={crudConfig.permission}
                  moduleKey={crudConfig.key}
                  moduleLabel={crudConfig.label}
                  fields={crudConfig.fields}
                  row={crudRow}
                  label="จัดการแผนนี้"
                  adminHref={`/admin/modules/${crudConfig.key}`}
                  afterDeleteHref={`/admin/modules/${crudConfig.key}`}
                />
              ) : (
                <AdminInlineTools user={adminUser} permission="plans" module="plans" label="จัดการแผนนี้" showCreate={false} />
              )}
            </div>
            <CardTitle className="max-w-4xl text-2xl font-extrabold leading-9 text-blue-950 md:text-3xl">
              {document.title}
            </CardTitle>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                เผยแพร่ {displayDate(document.publishedAt)}
              </span>
              <span>{document.department}</span>
              <span>{document.downloadCount.toLocaleString("th-TH")} ดาวน์โหลด</span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 space-y-5">
              {document.summary ? (
                <p className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-base leading-7 text-slate-700">
                  {document.summary}
                </p>
              ) : null}

              {document.content ? (
                <div
                  className="space-y-4 text-sm leading-7 text-slate-700 md:text-base [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-7"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              ) : (
                <p className="text-sm leading-7 text-slate-600">
                  เอกสารนี้เผยแพร่เพื่อให้ประชาชน ผู้เรียน และผู้เกี่ยวข้องสามารถตรวจสอบแผนงานและการดำเนินงานของวิทยาลัยได้
                  สามารถเปิดอ่านหรือดาวน์โหลดไฟล์ PDF ได้จากปุ่มด้านข้าง
                </p>
              )}

              {document.fileUrl ? (
                <div className="overflow-hidden rounded-lg border border-blue-100 bg-slate-50">
                  <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-white px-4 py-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-slate-950">ตัวอย่างไฟล์เอกสาร</h2>
                      <p className="truncate text-xs text-slate-500">{document.fileName ?? document.fileType}</p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <a href={withBasePath(document.downloadUrl)} target="_blank" rel="noreferrer">
                        <Download data-icon="inline-start" />
                        ดาวน์โหลด
                      </a>
                    </Button>
                  </div>
                  <iframe
                    title={document.title}
                    src={document.fileUrl}
                    className="h-[70vh] min-h-[520px] w-full bg-white"
                  />
                </div>
              ) : null}
            </div>

            <aside className="space-y-4">
              <Card className="border-blue-100">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-md bg-blue-600 text-white">
                      <FileText className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-blue-700">ไฟล์เอกสาร</p>
                      <p className="font-bold text-slate-950">{document.fileType}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between gap-3">
                      <span>ประเภท</span>
                      <strong className="text-right text-slate-900">{document.reportType}</strong>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>ปี/ช่วงปี</span>
                      <strong className="text-right text-slate-900">{document.fiscalYear ?? "-"}</strong>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>ดาวน์โหลด</span>
                      <strong className="text-right text-slate-900">{document.downloadCount.toLocaleString("th-TH")} ครั้ง</strong>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <a href={withBasePath(document.downloadUrl)} target="_blank" rel="noreferrer">
                      <Download data-icon="inline-start" />
                      ดาวน์โหลด PDF
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {relatedDocuments.length ? (
                <Card className="border-blue-100">
                  <CardContent className="p-4">
                    <h2 className="font-bold text-slate-950">เอกสารประเภทเดียวกัน</h2>
                    <div className="mt-3 divide-y divide-blue-100">
                      {relatedDocuments.map((item) => (
                        <Link key={item.id} href={item.href} className="block py-3 text-sm hover:text-blue-700">
                          <strong className="line-clamp-2 leading-6">{item.title}</strong>
                          <span className="mt-1 block text-xs text-slate-500">ปี {item.fiscalYear ?? "-"} · {displayDate(item.publishedAt)}</span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </aside>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
