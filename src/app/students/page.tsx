import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Filter, GraduationCap, Table2, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { AdminInlineTools } from "@/components/public/admin-inline-tools";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { queryRows } from "@/lib/db";
import { getSiteOverview, type CourseGroup } from "@/lib/site-data";

type RawStudentEnrollment = {
  id: number;
  academic_year: string;
  level_label: string;
  department_name: string;
  student_count: number;
  male_count: number | null;
  female_count: number | null;
  note: string | null;
  sort_order: number;
  status: string;
};

type DepartmentCatalogRow = {
  key: string;
  name: string;
  href?: string;
  levels: string[];
};

type SearchParams = Record<string, string | string[] | undefined>;

function isExternalLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function firstSearchValue(params: SearchParams, key: string): string | undefined {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeDepartmentName(value: string): string {
  return value
    .replace(/แผนกวิชา/g, "")
    .replace(/สาขาวิชา/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function compareAcademicYearDesc(left: string, right: string): number {
  return right.localeCompare(left, "th-TH", { numeric: true });
}

function buildStudentHref(year: string, department?: string): string {
  const params = new URLSearchParams();
  params.set("year", year);

  if (department) {
    params.set("department", department);
  }

  return `/students?${params.toString()}#student-data`;
}

function buildDepartmentCatalog(courseGroups: CourseGroup[]): DepartmentCatalogRow[] {
  const byName = new Map<string, DepartmentCatalogRow>();

  for (const group of courseGroups) {
    for (const department of group.departments) {
      const key = normalizeDepartmentName(department.name);
      const existing = byName.get(key);

      if (existing) {
        if (!existing.levels.includes(group.level)) {
          existing.levels.push(group.level);
        }
        existing.href = existing.href ?? department.href;
        continue;
      }

      byName.set(key, {
        key,
        name: department.name,
        href: department.href,
        levels: [group.level],
      });
    }
  }

  return Array.from(byName.values());
}

function fallbackEnrollmentRows(courseGroups: CourseGroup[], academicYear: string): RawStudentEnrollment[] {
  let index = 0;

  return courseGroups.flatMap((group) =>
    group.departments.map((department) => {
      index += 1;

      return {
        id: -index,
        academic_year: academicYear,
        level_label: group.level,
        department_name: department.name,
        student_count: 0,
        male_count: null,
        female_count: null,
        note: "รอกรอกจำนวนผู้เรียนจริง",
        sort_order: index,
        status: "active",
      };
    })
  );
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right, "th-TH"));
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [overview, adminUser, enrollmentConfig] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("student_enrollments"),
  ]);
  const [enrollmentRows, crudRows] = await Promise.all([
    queryRows<RawStudentEnrollment>(
      `SELECT id, academic_year, level_label, department_name, student_count, male_count, female_count, note, sort_order, status
       FROM student_enrollments
       WHERE status = 'active'
       ORDER BY academic_year DESC, sort_order, level_label, department_name, id`
    ),
    enrollmentConfig ? getAdminCrudRows(enrollmentConfig, 500) : Promise.resolve(null),
  ]);

  const catalog = buildDepartmentCatalog(overview.courseGroups);
  const enrollments = enrollmentRows?.length ? enrollmentRows : fallbackEnrollmentRows(overview.courseGroups, "2569");
  const availableYears = Array.from(new Set(enrollments.map((row) => row.academic_year))).sort(compareAcademicYearDesc);
  const requestedYear = firstSearchValue(resolvedSearchParams, "year");
  const selectedYear = requestedYear && availableYears.includes(requestedYear) ? requestedYear : availableYears[0] ?? "2569";
  const rowsForYear = enrollments.filter((row) => row.academic_year === selectedYear);
  const departmentsForYear = uniqueSorted(rowsForYear.map((row) => row.department_name));
  const requestedDepartment = firstSearchValue(resolvedSearchParams, "department");
  const selectedDepartment =
    requestedDepartment && departmentsForYear.includes(requestedDepartment) ? requestedDepartment : undefined;
  const visibleRows = selectedDepartment
    ? rowsForYear.filter((row) => row.department_name === selectedDepartment)
    : rowsForYear;
  const crudRowsById = new Map((crudRows ?? []).map((row) => [row.id, row]));
  const departmentHrefByName = new Map(catalog.map((department) => [normalizeDepartmentName(department.name), department.href]));
  const yearTotal = rowsForYear.reduce((sum, row) => sum + Number(row.student_count ?? 0), 0);
  const visibleTotal = visibleRows.reduce((sum, row) => sum + Number(row.student_count ?? 0), 0);
  const filledRowCount = rowsForYear.filter((row) => Number(row.student_count ?? 0) > 0).length;
  const levelTotals = uniqueSorted(rowsForYear.map((row) => row.level_label)).map((level) => ({
    level,
    total: rowsForYear
      .filter((row) => row.level_label === level)
      .reduce((sum, row) => sum + Number(row.student_count ?? 0), 0),
  }));

  return (
    <SiteShell active="students" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section id="student-data" className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading
          title="ข้อมูลผู้เรียน"
          description="สรุปจำนวนนักเรียน นักศึกษา และผู้เรียนระยะสั้น แยกตามปีการศึกษา ระดับ และแผนกวิชา พร้อมระบบจัดการย้อนหลังในหลังบ้าน"
          action={
            enrollmentConfig ? (
              <AdminCrudCreateButton
                user={adminUser}
                permission={enrollmentConfig.permission}
                moduleKey={enrollmentConfig.key}
                moduleLabel={enrollmentConfig.label}
                fields={enrollmentConfig.fields}
                label="เพิ่มข้อมูลผู้เรียน"
                adminHref="/admin/modules/student_enrollments"
              />
            ) : null
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-blue-100 bg-blue-700 p-4 text-white shadow-sm">
            <span className="flex items-center gap-2 text-xs font-semibold text-blue-100">
              <UsersRound className="size-4" />
              ผู้เรียนรวมปี {selectedYear}
            </span>
            <strong className="mt-2 block text-3xl">{yearTotal.toLocaleString("th-TH")}</strong>
            <span className="text-sm text-blue-100">คน</span>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
            <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <BookOpen className="size-4" />
              แผนก/หลักสูตร
            </span>
            <strong className="mt-2 block text-3xl text-slate-950">{departmentsForYear.length.toLocaleString("th-TH")}</strong>
            <span className="text-sm text-slate-500">รายการในปีที่เลือก</span>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
            <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Table2 className="size-4" />
              กรอกแล้ว
            </span>
            <strong className="mt-2 block text-3xl text-slate-950">{filledRowCount.toLocaleString("th-TH")}</strong>
            <span className="text-sm text-slate-500">แถวข้อมูลที่มีจำนวนผู้เรียน</span>
          </div>
          <div className="rounded-lg border border-blue-100 bg-sky-50 p-4 shadow-sm shadow-blue-950/5">
            <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Filter className="size-4" />
              มุมมองปัจจุบัน
            </span>
            <strong className="mt-2 block text-2xl text-slate-950">{visibleTotal.toLocaleString("th-TH")}</strong>
            <span className="line-clamp-1 text-sm text-slate-500">{selectedDepartment ?? "ภาพรวมทุกแผนก"}</span>
          </div>
        </div>

        <section className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-normal text-slate-950">เลือกปีการศึกษาและแผนกวิชา</h2>
              <p className="mt-1 text-sm text-slate-600">ใช้ตัวกรองนี้เพื่อดูข้อมูลย้อนหลัง หรือดูเฉพาะแผนกที่ต้องการ</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableYears.map((year) => (
                <Button key={year} asChild size="sm" variant={year === selectedYear ? "default" : "outline"}>
                  <Link href={buildStudentHref(year, selectedDepartment)}>
                    <CalendarDays data-icon="inline-start" />
                    {year}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant={!selectedDepartment ? "default" : "outline"}>
              <Link href={buildStudentHref(selectedYear)}>ภาพรวม</Link>
            </Button>
            {departmentsForYear.map((department) => (
              <Button key={department} asChild size="sm" variant={department === selectedDepartment ? "default" : "outline"}>
                <Link href={buildStudentHref(selectedYear, department)}>{department}</Link>
              </Button>
            ))}
          </div>
        </section>

        {levelTotals.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {levelTotals.map((item) => (
              <div key={item.level} className="rounded-lg border border-blue-100 bg-sky-50 p-4">
                <span className="text-xs font-semibold text-blue-700">ระดับ {item.level}</span>
                <strong className="mt-1 block text-2xl text-slate-950">{item.total.toLocaleString("th-TH")} คน</strong>
              </div>
            ))}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-950/5">
          <div className="flex flex-col gap-2 border-b border-blue-100 bg-sky-50 px-4 py-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">ตารางจำนวนผู้เรียนรายแผนก</h2>
              <p className="mt-1 text-sm text-slate-600">
                ปีการศึกษา {selectedYear} {selectedDepartment ? `เฉพาะ${selectedDepartment}` : "ภาพรวมทุกแผนกและทุกระดับ"}
              </p>
            </div>
            <Badge variant="secondary">{visibleRows.length.toLocaleString("th-TH")} รายการ</Badge>
          </div>

          <div className="hidden grid-cols-[1fr_120px_120px_120px_150px] gap-3 border-b bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
            <span>แผนกวิชา / ระดับ</span>
            <span>รวม</span>
            <span>ชาย</span>
            <span>หญิง</span>
            <span className="text-right">การจัดการ</span>
          </div>

          <div className="divide-y divide-blue-100">
            {visibleRows.map((row) => {
              const crudRow = row.id > 0 ? crudRowsById.get(row.id) : undefined;
              const departmentHref = departmentHrefByName.get(normalizeDepartmentName(row.department_name));

              return (
                <div key={`${row.id}-${row.department_name}-${row.level_label}`} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_120px_120px_120px_150px] md:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                      <BookOpen className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-base text-slate-950">{row.department_name}</strong>
                        <Badge variant="outline">{row.level_label}</Badge>
                      </div>
                      {row.note ? <p className="mt-1 text-xs leading-5 text-slate-500">{row.note}</p> : null}
                      {departmentHref ? (
                        <Link
                          href={departmentHref}
                          target={isExternalLink(departmentHref) ? "_blank" : undefined}
                          rel={isExternalLink(departmentHref) ? "noreferrer" : undefined}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                        >
                          เปิดเว็บไซต์/เพจแผนก
                          <ArrowRight className="size-3" />
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <strong className="text-xl text-blue-700">{Number(row.student_count ?? 0).toLocaleString("th-TH")}</strong>
                  <span className="text-sm text-slate-600">{row.male_count === null ? "-" : Number(row.male_count).toLocaleString("th-TH")}</span>
                  <span className="text-sm text-slate-600">{row.female_count === null ? "-" : Number(row.female_count).toLocaleString("th-TH")}</span>

                  <div className="flex justify-start md:justify-end">
                    {enrollmentConfig && crudRow ? (
                      <AdminCrudTools
                        user={adminUser}
                        permission={enrollmentConfig.permission}
                        moduleKey={enrollmentConfig.key}
                        moduleLabel={enrollmentConfig.label}
                        fields={enrollmentConfig.fields}
                        row={crudRow}
                        label="จัดการ"
                        triggerSize="sm"
                        adminHref="/admin/modules/student_enrollments"
                        afterDeleteHref="/admin/modules/student_enrollments"
                      />
                    ) : enrollmentConfig ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/admin/modules/student_enrollments">เพิ่มข้อมูล</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      <section className="border-y border-blue-100 bg-sky-50/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6">
          <SectionHeading
            title="บริการสำหรับผู้เรียน"
            description="ช่องทางบริการออนไลน์ เอกสาร และระบบที่นักเรียน นักศึกษาต้องใช้บ่อย"
            action={
              <AdminInlineTools
                user={adminUser}
                permission="cms.quick_links"
                module="quick_links"
                label="จัดการลิงก์ผู้เรียน"
              />
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overview.quickLinks.slice(0, 6).map((link) => (
              <Link
                key={link.itemKey}
                href={link.href}
                target={isExternalLink(link.href) ? "_blank" : undefined}
                rel={isExternalLink(link.href) ? "noreferrer" : undefined}
                className="group flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-white p-4 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white">
                    <GraduationCap className="size-4" />
                  </span>
                  <span className="line-clamp-2">{link.label}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-blue-700 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
