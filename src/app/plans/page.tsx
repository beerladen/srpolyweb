import Link from "next/link";
import { ArrowRight, CalendarDays, Download, FileCheck2, FileClock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { withBasePath } from "@/lib/base-path";
import { getPlanCenterData, planTypeSlug, type PlanDocument, type PlanReportType } from "@/lib/plan-data";
import { getSiteOverview, statusLabel, statusVariant } from "@/lib/site-data";

type PlansPageProps = {
  searchParams?: Promise<{
    type?: string;
    year?: string;
  }>;
};

const planTypeTabs: { label: string; value: "all" | "development" | "action" | "other" }[] = [
  { label: "ทั้งหมด", value: "all" },
  { label: "แผนพัฒนา", value: "development" },
  { label: "แผนปฏิบัติการ", value: "action" },
  { label: "รายงานอื่น", value: "other" },
];

function displayDate(value?: string): string {
  return value ? value.slice(0, 10) : "ยังไม่ระบุวันที่";
}

function queryFor(type: string, year?: string) {
  const params = new URLSearchParams();

  if (type !== "all") {
    params.set("type", type);
  }

  if (year && year !== "all") {
    params.set("year", year);
  }

  const query = params.toString();

  return query ? `/plans?${query}` : "/plans";
}

function typeTone(type: PlanReportType): string {
  if (type === "แผนพัฒนา") {
    return "border-blue-100 bg-blue-50 text-blue-800";
  }

  if (type === "แผนปฏิบัติการ") {
    return "border-cyan-100 bg-cyan-50 text-cyan-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function PlanCurrentCard({ document }: { document: PlanDocument }) {
  return (
    <Card className="overflow-hidden border-blue-100 shadow-sm shadow-blue-950/5">
      <CardContent className="p-0">
        <div className="grid min-h-64 md:grid-cols-[1fr_170px]">
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={typeTone(document.reportType)} variant="outline">
                {document.reportType}
              </Badge>
              <Badge variant="secondary">เอกสารปัจจุบัน</Badge>
              {document.fiscalYear ? <Badge variant="outline">ปี {document.fiscalYear}</Badge> : null}
            </div>
            <div>
              <h2 className="text-xl font-extrabold leading-8 text-slate-950">{document.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {document.summary ?? "เอกสารเผยแพร่สำหรับติดตามทิศทาง แผนงาน และการดำเนินงานของวิทยาลัย"}
              </p>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {displayDate(document.publishedAt)}
              </span>
              <span>{document.department}</span>
              <span>{document.downloadCount.toLocaleString("th-TH")} ดาวน์โหลด</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={document.href}>
                  เปิดรายละเอียด
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-blue-200 bg-white">
                <a href={withBasePath(document.downloadUrl)} target="_blank" rel="noreferrer">
                  <Download data-icon="inline-start" />
                  ดาวน์โหลด PDF
                </a>
              </Button>
            </div>
          </div>
          <div className="hidden border-l border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_58%,#dff7ff_100%)] p-5 md:flex md:flex-col md:items-center md:justify-center">
            <span className="flex size-20 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm shadow-blue-950/10">
              <FileCheck2 className="size-10" />
            </span>
            <span className="mt-4 text-center text-sm font-semibold text-blue-900">{document.fileType}</span>
            <span className="mt-1 max-w-32 truncate text-center text-xs text-slate-500">{document.fileName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedType = planTypeTabs.some((tab) => tab.value === resolvedSearchParams?.type)
    ? resolvedSearchParams?.type ?? "all"
    : "all";
  const selectedYear = resolvedSearchParams?.year ?? "all";
  const [overview, adminUser, crudConfig, planData] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("plans"),
    getPlanCenterData(),
  ]);
  const crudRows = crudConfig ? await getAdminCrudRows(crudConfig) : null;
  const crudRowsById = new Map((crudRows ?? []).map((row) => [row.id, row]));
  const filteredDocuments = planData.documents.filter((document) => {
    const matchesType = selectedType === "all" || planTypeSlug(document.reportType) === selectedType;
    const matchesYear = selectedYear === "all" || document.fiscalYear === selectedYear;

    return matchesType && matchesYear;
  });

  return (
    <SiteShell active="plans" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_58%,#edf8ff_100%)] p-5 shadow-sm shadow-blue-950/5 md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <Badge variant="outline" className="border-blue-100 bg-white text-blue-800">
                งานแผนและงบประมาณ
              </Badge>
              <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-blue-950 md:text-4xl">แผนและรายงาน</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                ศูนย์รวมแผนพัฒนาสถานศึกษาและแผนปฏิบัติการประจำปี เก็บเอกสาร PDF ย้อนหลังตามปีงบประมาณ
                เพื่อให้ผู้เรียน ประชาชน และผู้ตรวจประเมินเข้าถึงข้อมูลได้ชัดเจน
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {crudConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={crudConfig.permission}
                  moduleKey={crudConfig.key}
                  moduleLabel={crudConfig.label}
                  fields={crudConfig.fields}
                  label="เพิ่มเอกสารแผน"
                  createDialogTitle="เพิ่มแผน / รายงาน"
                  createDialogDescription="อัปโหลด PDF โดยเลือกประเภทเอกสารและปีงบประมาณ ระบบจะนำรายการล่าสุดไปแสดงบนหน้าแรกอัตโนมัติ"
                  createSubmitLabel="บันทึกเอกสาร"
                  initialValues={{
                    report_type: "แผนพัฒนา",
                    department: "งานแผนและงบประมาณ",
                    status: "published",
                    download_count: 0,
                  }}
                />
              ) : null}
              <Button asChild variant="outline" className="border-blue-200 bg-white">
                <Link href="/ita">
                  ตรวจสอบ ITA
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { label: "เอกสารเผยแพร่", value: planData.stats.totalDocuments, icon: FileText },
              { label: "เอกสารปัจจุบัน", value: planData.stats.currentDocuments, icon: FileCheck2 },
              { label: "ดาวน์โหลดรวม", value: planData.stats.totalDownloads, icon: Download },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-lg border border-blue-100 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-md bg-blue-600 text-white">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-blue-700">{item.label}</p>
                      <p className="text-2xl font-extrabold text-slate-950">{item.value.toLocaleString("th-TH")}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {planData.currentDocuments.length ? (
            planData.currentDocuments.map((document) => <PlanCurrentCard key={document.id} document={document} />)
          ) : (
            <Card className="border-blue-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 text-slate-600">
                  <FileClock className="size-5 text-blue-700" />
                  ยังไม่มีเอกสารปัจจุบันสำหรับแผนพัฒนาและแผนปฏิบัติการ
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-blue-100 shadow-sm shadow-blue-950/5">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-normal text-slate-950">เอกสารย้อนหลังตามปีงบประมาณ</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  เลือกประเภทหรือปีงบประมาณเพื่อค้นหาเอกสารแผนที่ต้องการ
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {planTypeTabs.map((tab) => (
                  <Button key={tab.value} asChild size="sm" variant={selectedType === tab.value ? "default" : "outline"}>
                    <Link href={queryFor(tab.value, selectedYear)}>{tab.label}</Link>
                  </Button>
                ))}
              </div>
            </div>

            {planData.years.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant={selectedYear === "all" ? "secondary" : "outline"}>
                  <Link href={queryFor(selectedType ?? "all", "all")}>ทุกปี</Link>
                </Button>
                {planData.years.map((year) => (
                  <Button key={year} asChild size="sm" variant={selectedYear === year ? "secondary" : "outline"}>
                    <Link href={queryFor(selectedType ?? "all", year)}>{year}</Link>
                  </Button>
                ))}
              </div>
            ) : null}

            <div className="mt-5 overflow-hidden rounded-lg border border-blue-100">
              <div className="hidden bg-slate-50 text-xs font-bold text-slate-600 md:grid md:grid-cols-[minmax(220px,1.5fr)_150px_110px_130px_120px_160px]">
                <div className="px-4 py-3">เอกสาร</div>
                <div className="px-4 py-3">ประเภท</div>
                <div className="px-4 py-3">ปี</div>
                <div className="px-4 py-3">เผยแพร่</div>
                <div className="px-4 py-3">ดาวน์โหลด</div>
                <div className="px-4 py-3 text-right">การทำงาน</div>
              </div>
              <div className="divide-y divide-blue-100">
                {filteredDocuments.map((document) => {
                  const crudRow = crudRowsById.get(document.id);

                  return (
                    <div
                      key={document.id}
                      className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(220px,1.5fr)_150px_110px_130px_120px_160px] md:items-center"
                    >
                      <div className="min-w-0">
                        <Link href={document.href} className="font-bold leading-6 text-slate-950 hover:text-blue-700">
                          {document.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                          {document.summary ?? document.department}
                        </p>
                      </div>
                      <div>
                        <Badge className={typeTone(document.reportType)} variant="outline">
                          {document.reportType}
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold text-slate-700">{document.fiscalYear ?? "-"}</div>
                      <div className="text-sm text-slate-600">{displayDate(document.publishedAt)}</div>
                      <div className="text-sm text-slate-600">{document.downloadCount.toLocaleString("th-TH")} ครั้ง</div>
                      <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                        <Button asChild size="sm" variant="outline">
                          <a href={withBasePath(document.downloadUrl)} target="_blank" rel="noreferrer">
                            <Download data-icon="inline-start" />
                            PDF
                          </a>
                        </Button>
                        {crudConfig && crudRow ? (
                          <AdminCrudTools
                            user={adminUser}
                            permission={crudConfig.permission}
                            moduleKey={crudConfig.key}
                            moduleLabel={crudConfig.label}
                            fields={crudConfig.fields}
                            row={crudRow}
                            label="จัดการ"
                            triggerSize="sm"
                            adminHref={`/admin/modules/${crudConfig.key}`}
                            afterDeleteHref={`/admin/modules/${crudConfig.key}`}
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {!filteredDocuments.length ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">ไม่พบเอกสารตามเงื่อนไขที่เลือก</div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
