import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { getSiteOverview, type ItaItem, statusLabel, statusVariant } from "@/lib/site-data";

const categoryDescriptions: Record<string, string> = {
  "9.1 ข้อมูลพื้นฐาน": "ข้อมูลหลักที่ประชาชนควรเข้าถึงได้ทันที เช่น โครงสร้าง ผู้บริหาร แผนพัฒนา ช่องทางติดต่อ และกฎหมายที่เกี่ยวข้อง",
  "9.2 การบริหารงาน ปฏิสัมพันธ์ข้อมูล และการดำเนินงาน": "ข้อมูลแผนปฏิบัติราชการ ผลการดำเนินงาน SAR และข่าวสารในปีงบประมาณปัจจุบัน",
  "9.3 การจัดซื้อจัดจ้างหรือการจัดหาพัสดุ": "ประกาศและรายงานผลการจัดซื้อจัดจ้างตามเกณฑ์ปีงบประมาณ 2569",
  "9.4 การปฏิบัติหน้าที่": "คู่มือ ขั้นตอนบริการ E-Service และข้อมูลสถิติหรือความพึงพอใจต่อการให้บริการ",
  "9.5 การบริหารและพัฒนาทรัพยากรบุคคล": "หลักเกณฑ์ HR การพัฒนาบุคลากร และการขับเคลื่อนจริยธรรม",
  "10.1 การจัดการเรื่องร้องเรียนการทุจริตและประพฤติมิชอบ": "แนวทางรับเรื่องร้องเรียนและข้อมูลสถิติเรื่องร้องเรียนด้านทุจริต",
  "10.2 มาตรการภายในเพื่อป้องกันการทุจริต": "No Gift Policy ควบคุมภายใน วัฒนธรรมสุจริต และมาตรการส่งเสริมคุณธรรมความโปร่งใส",
};

function groupItaItems(items: ItaItem[]) {
  return items.reduce<Array<{ category: string; items: ItaItem[] }>>((groups, item) => {
    const group = groups.find((entry) => entry.category === item.category);

    if (group) {
      group.items.push(item);
    } else {
      groups.push({ category: item.category, items: [item] });
    }

    return groups;
  }, []);
}

export default async function ItaPage() {
  const [overview, adminUser, crudConfig] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("ita"),
  ]);
  const crudRows = crudConfig ? await getAdminCrudRows(crudConfig) : null;
  const crudRowsById = new Map((crudRows ?? []).map((row) => [row.id, row]));
  const crudRowsByCode = new Map(
    (crudRows ?? []).map((row) => [String(row.values.ita_code ?? row.metric ?? "").trim().toUpperCase(), row])
  );
  const ready = overview.ita.filter((item) => item.status === "published").length;
  const review = overview.ita.filter((item) => item.status === "review").length;
  const draft = overview.ita.filter((item) => item.status === "draft").length;
  const groupedItems = groupItaItems(overview.ita);

  return (
    <SiteShell active="ita" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="border-b bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-[1fr_360px] md:px-6">
          <SectionHeading
            title="ITA / ข้อมูลสาธารณะ OIT 2569"
            description="ศูนย์รวมข้อมูลเปิดเผยต่อสาธารณะของวิทยาลัยตามเกณฑ์ Integrity and Transparency Assessment สำหรับสถานศึกษาอาชีวศึกษา ปีงบประมาณ พ.ศ. 2569"
            action={
              crudConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={crudConfig.permission}
                  moduleKey={crudConfig.key}
                  moduleLabel={crudConfig.label}
                  fields={crudConfig.fields}
                  label="เพิ่มตัวชี้วัด"
                />
              ) : null
            }
          />

          <Card className="border-blue-100 bg-white/85 shadow-sm shadow-blue-950/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-5 text-blue-700" />
                สถานะ OIT
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md bg-blue-600 p-3 text-white">
                <strong className="block text-2xl">{ready}</strong>
                <span className="text-xs">เผยแพร่แล้ว</span>
              </div>
              <div className="rounded-md bg-amber-50 p-3 text-amber-900">
                <strong className="block text-2xl">{review}</strong>
                <span className="text-xs">รอตรวจ</span>
              </div>
              <div className="rounded-md bg-slate-100 p-3 text-slate-700">
                <strong className="block text-2xl">{draft}</strong>
                <span className="text-xs">ร่าง</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-3 md:px-6">
        <Card className="border-blue-100">
          <CardContent className="flex gap-3 p-5">
            <CheckCircle2 className="mt-1 size-5 text-blue-700" />
            <div>
              <strong className="text-sm">ตัวชี้วัดที่ 9</strong>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">การเปิดเผยข้อมูล O1-O17 ครอบคลุมข้อมูลพื้นฐาน งานบริหาร พัสดุ บริการ และบุคลากร</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-cyan-100">
          <CardContent className="flex gap-3 p-5">
            <ShieldCheck className="mt-1 size-5 text-cyan-700" />
            <div>
              <strong className="text-sm">ตัวชี้วัดที่ 10</strong>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">การป้องกันการทุจริต O18-O23 ครอบคลุมเรื่องร้องเรียน No Gift Policy และมาตรการภายใน</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="flex gap-3 p-5">
            <FileText className="mt-1 size-5 text-slate-700" />
            <div>
              <strong className="text-sm">หลักฐาน 23 ข้อ</strong>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">แต่ละรายการมีลิงก์หลักฐาน ผู้รับผิดชอบ สถานะ และปุ่มจัดการเมื่อเข้าสู่ระบบแอดมิน</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-12 md:px-6">
        {groupedItems.map((group) => (
          <Card key={group.category} className="border-blue-100 shadow-sm shadow-blue-950/5">
            <CardHeader className="gap-2 border-b bg-blue-50/60">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-lg">{group.category}</CardTitle>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {categoryDescriptions[group.category] ?? "รายการข้อมูลเปิดเผยต่อสาธารณะตามเกณฑ์ ITA"}
                  </p>
                </div>
                <Badge variant="outline">{group.items.length} รายการ</Badge>
              </div>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {group.items.map((item) => {
                const crudRow = crudRowsById.get(item.id) ?? crudRowsByCode.get(item.code.trim().toUpperCase());

                return (
                  <article key={item.id} className="grid gap-4 p-4 md:grid-cols-[88px_1fr_auto] md:items-center">
                    <div className="flex items-center gap-2 md:flex-col md:items-start">
                      <Badge className="bg-blue-700 text-white hover:bg-blue-700">{item.code}</Badge>
                      <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-base font-semibold leading-7 text-slate-950">{item.title}</h2>
                      {item.description ? (
                        <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">{item.description}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {item.fiscalYear ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">ปีงบประมาณ {item.fiscalYear}</span>
                        ) : null}
                        {item.responsiblePerson ? (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800">ผู้รับผิดชอบ: {item.responsiblePerson}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={item.href}>
                          เปิดหลักฐาน
                          <ArrowRight data-icon="inline-end" />
                        </Link>
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
                        />
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col gap-2 p-5 text-sm leading-6 text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>
              ข้อมูลอ้างอิงจากคู่มือ ITA สถานศึกษาอาชีวศึกษา ปีงบประมาณ พ.ศ. 2569 และยังสามารถปรับสถานะหรือลิงก์หลักฐานได้จากหลังบ้าน
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
              <Clock3 className="size-4" />
              ปรับปรุงล่าสุดจากฐานข้อมูลเว็บไซต์
            </span>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
