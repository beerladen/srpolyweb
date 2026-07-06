import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { AdminCrudCreateButton } from "@/components/public/admin-crud-tools";
import { DownloadCenter } from "@/components/public/download-center";
import { SiteShell } from "@/components/public/site-shell";
import { Button } from "@/components/ui/button";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { getDownloadCenterData } from "@/lib/document-data";
import { getSiteOverview } from "@/lib/site-data";

export default async function DocumentsPage() {
  const [overview, adminUser, crudConfig, categoryConfig, downloadData] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("documents"),
    getAdminCrudAvailableConfig("document_categories"),
    getDownloadCenterData(),
  ]);
  const crudRows = crudConfig ? await getAdminCrudRows(crudConfig) : null;

  return (
    <SiteShell active="documents" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <div className="relative overflow-hidden rounded-lg border border-blue-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5 shadow-sm shadow-blue-950/5 md:p-7">
          <div className="flex max-w-4xl flex-col gap-5">
            <div className="flex items-start gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white shadow-lg shadow-blue-950/15">
                <Download className="size-8" />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-normal text-slate-950 md:text-4xl">
                  ดาวน์โหลดเอกสาร
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  ศูนย์รวมคำร้อง แบบฟอร์ม คู่มือ และเอกสารบริการสำหรับนักเรียน นักศึกษา ผู้ปกครอง และบุคลากร
                  แยกตามฝ่ายงานและหมวดหมู่ของวิทยาลัย
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {crudConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={crudConfig.permission}
                  moduleKey={crudConfig.key}
                  moduleLabel={crudConfig.label}
                  fields={crudConfig.fields}
                  label="เพิ่มเอกสาร"
                />
              ) : null}
              <Button asChild variant="outline" className="bg-white">
                <Link href="#download-list">
                  ดูรายการเอกสาร
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <DownloadCenter
          {...downloadData}
          adminUser={adminUser}
          crudConfig={crudConfig}
          crudRows={crudRows}
          categoryConfig={categoryConfig}
        />
      </section>
    </SiteShell>
  );
}
