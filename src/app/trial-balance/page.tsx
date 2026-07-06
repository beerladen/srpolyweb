import { Download } from "lucide-react";
import { DownloadCenter } from "@/components/public/download-center";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { getSiteOverview } from "@/lib/site-data";
import { getTrialBalanceData } from "@/lib/trial-balance-data";

export default async function TrialBalancePage({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const fiscalYear = resolvedSearchParams?.year?.trim();
  const [overview, adminUser, crudConfig, trialBalanceData] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("trial_balance_reports"),
    getTrialBalanceData(),
  ]);
  const crudRows = crudConfig ? await getAdminCrudRows(crudConfig) : null;

  return (
    <SiteShell active="trial-balance" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-sm shadow-blue-950/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="flex size-12 items-center justify-center rounded-lg bg-white/15">
                <Download className="size-7" />
              </div>
              <p className="mt-4 text-sm font-bold text-blue-100">งานการเงิน</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-normal md:text-4xl">รายงานงบทดลอง</h1>
              <p className="mt-3 text-sm leading-7 text-blue-50 md:text-base">
                รวมรายงานงบทดลองประจำปีงบประมาณ พร้อมระบบค้นหา กรองปีงบประมาณ เปิดอ่าน และดาวน์โหลดไฟล์ได้จากจุดเดียว
              </p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">
              <strong className="block text-2xl">{trialBalanceData.documents.length.toLocaleString("th-TH")}</strong>
              <span className="text-sm text-blue-50">รายการเผยแพร่</span>
            </div>
          </div>
        </div>

        <DownloadCenter
          {...trialBalanceData}
          adminUser={adminUser}
          crudConfig={crudConfig}
          crudRows={crudRows}
          initialCategory={fiscalYear ? `year-${fiscalYear}` : undefined}
          afterCreateHref="/trial-balance"
          copy={{
            eyebrow: "รายงานงบทดลองออนไลน์",
            title: "ค้นหารายงานงบทดลอง",
            description: "ค้นหาชื่อรายงาน กรองปีงบประมาณ หน่วยงาน และชนิดไฟล์ แสดงแบบตารางเหมือนระบบดาวน์โหลดเอกสาร",
            searchPlaceholder: "ค้นหาปีงบประมาณ ชื่อรายงาน หน่วยงาน หรือคำค้น",
            addDocumentLabel: "เพิ่มรายงาน",
            categoryAllLabel: "ทุกปีงบประมาณ",
            departmentAllLabel: "ทุกหน่วยงาน",
            fileTypeAllLabel: "ทุกชนิดไฟล์",
            emptyMessage: "ไม่พบรายงานงบทดลองตามเงื่อนไขที่เลือก",
          }}
        />
      </section>
    </SiteShell>
  );
}
