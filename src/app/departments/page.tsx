import Link from "next/link";
import { Building2, ExternalLink, GraduationCap, Landmark, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { AdminInlineTools } from "@/components/public/admin-inline-tools";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { queryRows } from "@/lib/db";
import { getSiteOverview } from "@/lib/site-data";

type RawAdministrativeUnit = {
  id: number;
  full_name: string;
  position_title: string;
  department: string | null;
  sort_order: number;
};

function isExternalLink(href?: string): boolean {
  return Boolean(href?.startsWith("http://") || href?.startsWith("https://"));
}

function unitSummary(department: string): string {
  const summaries: Record<string, string> = {
    "ฝ่ายวิชาการ": "ดูแลหลักสูตร การเรียนการสอน งานทะเบียน วัดผล และมาตรฐานวิชาชีพ",
    "ฝ่ายบริหารทรัพยากร": "ดูแลงานบุคลากร การเงิน พัสดุ อาคารสถานที่ และทรัพยากรสนับสนุน",
    "ฝ่ายพัฒนากิจการนักเรียนนักศึกษา": "ดูแลงานกิจกรรมนักเรียน นักศึกษา วินัย แนะแนว และสวัสดิการ",
    "ฝ่ายแผนงานและความร่วมมือ": "ดูแลงานแผน งบประมาณ ความร่วมมือ สารสนเทศ และประกันคุณภาพ",
  };

  return summaries[department] ?? "หน่วยงานสนับสนุนการบริหารและบริการของวิทยาลัย";
}

export default async function DepartmentsPage() {
  const [overview, adminUser, courseConfig] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("course_groups"),
  ]);
  const [courseRows, administrativeUnits] = await Promise.all([
    courseConfig ? getAdminCrudRows(courseConfig) : Promise.resolve(null),
    queryRows<RawAdministrativeUnit>(
      `SELECT id, full_name, position_title, department, sort_order
       FROM personnel_profiles
       WHERE page_slug = 'administrators'
         AND status = 'active'
         AND department IS NOT NULL
         AND department <> ''
         AND department <> 'วิทยาลัยสารพัดช่างสุรินทร์'
       ORDER BY sort_order, id`
    ),
  ]);
  const courseRowsById = new Map((courseRows ?? []).map((row) => [row.id, row]));
  const units = administrativeUnits ?? [];

  return (
    <SiteShell active="departments" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading
          title="หน่วยงานภายในวิทยาลัย"
          description="รวมฝ่ายงานบริหาร แผนกวิชา และช่องทางติดต่อหน่วยงาน เพื่อให้ผู้เรียน ผู้ปกครอง และประชาชนเข้าถึงบริการได้ถูกจุด"
          action={
            <AdminInlineTools
              user={adminUser}
              permission="personnel"
              module="personnel_profiles"
              label="จัดการฝ่ายงาน"
              showCreate={false}
            />
          }
        />

        <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-950/5">
          <div className="border-b border-blue-100 bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 px-5 py-5 text-white">
            <Badge className="bg-white text-blue-800 hover:bg-white">โครงสร้างฝ่ายงาน</Badge>
            <h2 className="mt-2 text-2xl font-bold">ฝ่ายงานหลักของสถานศึกษา</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-50">
              แสดงฝ่ายงานตามโครงสร้างการบริหาร โดยดึงจากข้อมูลผู้บริหารที่จัดการได้ในระบบหลังบ้าน
            </p>
          </div>
          <div className="grid gap-0 divide-y divide-blue-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {units.map((unit, index) => (
              <article key={`${unit.department}-${unit.id}`} className="flex gap-4 p-5">
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-md text-white ${
                    index % 4 === 0
                      ? "bg-blue-700"
                      : index % 4 === 1
                        ? "bg-cyan-600"
                        : index % 4 === 2
                          ? "bg-emerald-600"
                          : "bg-amber-500"
                  }`}
                >
                  <Landmark className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-slate-950">{unit.department}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{unitSummary(unit.department ?? "")}</p>
                  <div className="mt-3 rounded-md bg-sky-50 px-3 py-2 text-sm text-slate-700">
                    <span className="font-semibold">ผู้รับผิดชอบ: </span>
                    {unit.full_name === "- ว่าง -" ? "รอแต่งตั้ง" : unit.full_name}
                    <span className="block text-xs text-slate-500">{unit.position_title}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="academic-departments" className="flex flex-col gap-5">
          <SectionHeading
            title="แผนกวิชาและเว็บไซต์แผนก"
            description="รวมหลักสูตร รายชื่อแผนก และลิงก์เว็บไซต์หรือเพจแผนกจากระบบเดิม"
            action={
              courseConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={courseConfig.permission}
                  moduleKey={courseConfig.key}
                  moduleLabel={courseConfig.label}
                  fields={courseConfig.fields}
                  label="เพิ่มหลักสูตร/แผนก"
                />
              ) : null
            }
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {overview.courseGroups.map((group) => {
              const courseRow = courseRowsById.get(group.id);

              return (
                <section key={group.id} className="flex min-h-full flex-col overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-950/5">
                  <div className="flex items-start justify-between gap-3 border-b border-blue-100 bg-sky-50 p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-md bg-blue-700 text-white">
                          <GraduationCap className="size-4" />
                        </span>
                        <Badge variant="secondary">{group.level}</Badge>
                      </div>
                      <h3 className="mt-3 text-lg font-bold leading-6 text-slate-950">{group.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{group.description}</p>
                    </div>
                    {courseConfig && courseRow ? (
                      <AdminCrudTools
                        user={adminUser}
                        permission={courseConfig.permission}
                        moduleKey={courseConfig.key}
                        moduleLabel={courseConfig.label}
                        fields={courseConfig.fields}
                        row={courseRow}
                        label="จัดการ"
                        triggerSize="sm"
                        adminHref="/admin/modules/course_groups"
                        afterDeleteHref="/admin/modules/course_groups"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col divide-y divide-blue-100">
                    {group.departments.map((department) => (
                      <div key={`${group.id}-${department.name}`} className="flex items-center justify-between gap-3 px-4 py-3">
                        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
                          <Building2 className="size-4 shrink-0 text-blue-700" />
                          <span className="line-clamp-1">{department.name}</span>
                        </span>
                        {department.href ? (
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={department.href}
                              target={isExternalLink(department.href) ? "_blank" : undefined}
                              rel={isExternalLink(department.href) ? "noreferrer" : undefined}
                            >
                              เปิด
                              <ExternalLink data-icon="inline-end" />
                            </Link>
                          </Button>
                        ) : (
                          <Badge variant="outline">รอลิงก์</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-blue-100 bg-sky-50 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white">
                <UsersRound className="size-5" />
              </span>
              <div>
                <h2 className="font-bold text-slate-950">ข้อมูลบุคลากรของวิทยาลัย</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  รายชื่อบุคลากร ตำแหน่ง หน้าที่ และช่องทางติดต่อ แยกไปอยู่ในหน้าเฉพาะเพื่อไม่ปนกับหน้าแผนกวิชา
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/content/personnel-data">
                เปิดหน้าข้อมูลบุคลากร
                <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </section>
      </section>
    </SiteShell>
  );
}

function ArrowRightIcon() {
  return <ExternalLink data-icon="inline-end" />;
}
