import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  GraduationCap,
  Layers3,
  Table2,
  UsersRound,
} from "lucide-react";
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
  report_date: string | null;
  level_label: string;
  department_name: string;
  student_count: number;
  registered_count: number | null;
  unregistered_count: number | null;
  repeat_count: number | null;
  credit_collect_count: number | null;
  actual_count: number | null;
  male_count: number | null;
  female_count: number | null;
  note: string | null;
  sort_order: number;
  status: string;
};

type RawShortCourseEnrollment = {
  id: number;
  academic_year: string;
  term_label: string | null;
  department_name: string | null;
  course_name: string;
  batch_label: string | null;
  hours: number | null;
  learner_count: number;
  male_count: number | null;
  female_count: number | null;
  completed_count: number | null;
  certificate_count: number | null;
  start_date: string | null;
  end_date: string | null;
  instructor_name: string | null;
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
type StudentTab = "regular" | "short";

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

function toThaiNumber(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString("th-TH");
}

function valueOrDash(value: number | null | undefined): string {
  return value === null || value === undefined ? "-" : toThaiNumber(value);
}

function actualStudentCount(row: RawStudentEnrollment): number {
  return Number(row.actual_count ?? row.student_count ?? 0);
}

function buildStudentHref(options: { year: string; department?: string; tab?: StudentTab }): string {
  const params = new URLSearchParams();
  params.set("year", options.year);

  if (options.tab && options.tab !== "regular") {
    params.set("tab", options.tab);
  }

  if (options.department) {
    params.set("department", options.department);
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
        report_date: null,
        level_label: group.level,
        department_name: department.name,
        student_count: 0,
        registered_count: null,
        unregistered_count: null,
        repeat_count: null,
        credit_collect_count: null,
        actual_count: null,
        male_count: null,
        female_count: null,
        note: "รอกรอกจำนวนผู้เรียนจริง",
        sort_order: index,
        status: "active",
      };
    })
  );
}

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((left, right) =>
    left.localeCompare(right, "th-TH")
  );
}

function formatThaiDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function levelSortWeight(level: string): number {
  const normalized = level.replace(/\s+/g, "");

  if (normalized.includes("ปวช.1")) return 10;
  if (normalized.includes("ปวช.2")) return 20;
  if (normalized.includes("ปวช.3")) return 30;
  if (normalized.includes("ปวช")) return 40;
  if (normalized.includes("ปวส.1")) return 50;
  if (normalized.includes("ปวส.2")) return 60;
  if (normalized.includes("ปวส")) return 70;

  return 100;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [overview, adminUser, enrollmentConfig, shortCourseConfig] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("student_enrollments"),
    getAdminCrudAvailableConfig("short_course_enrollments"),
  ]);
  const [enrollmentRows, shortCourseRows, crudRows, shortCrudRows] = await Promise.all([
    queryRows<RawStudentEnrollment>(
      `SELECT id, academic_year, report_date, level_label, department_name, student_count,
              registered_count, unregistered_count, repeat_count, credit_collect_count, actual_count,
              male_count, female_count, note, sort_order, status
       FROM student_enrollments
       WHERE status = 'active'
       ORDER BY academic_year DESC, sort_order, level_label, department_name, id`
    ),
    queryRows<RawShortCourseEnrollment>(
      `SELECT id, academic_year, term_label, department_name, course_name, batch_label, hours,
              learner_count, male_count, female_count, completed_count, certificate_count,
              start_date, end_date, instructor_name, note, sort_order, status
       FROM short_course_enrollments
       WHERE status = 'active'
       ORDER BY academic_year DESC, sort_order, department_name, course_name, id`
    ),
    enrollmentConfig ? getAdminCrudRows(enrollmentConfig, 500) : Promise.resolve(null),
    shortCourseConfig ? getAdminCrudRows(shortCourseConfig, 500) : Promise.resolve(null),
  ]);

  const catalog = buildDepartmentCatalog(overview.courseGroups);
  const regularEnrollments = enrollmentRows?.length ? enrollmentRows : fallbackEnrollmentRows(overview.courseGroups, "2569");
  const shortCourses = shortCourseRows ?? [];
  const availableYears = Array.from(
    new Set([...regularEnrollments.map((row) => row.academic_year), ...shortCourses.map((row) => row.academic_year)])
  ).sort(compareAcademicYearDesc);
  const requestedYear = firstSearchValue(resolvedSearchParams, "year");
  const selectedYear = requestedYear && availableYears.includes(requestedYear) ? requestedYear : availableYears[0] ?? "2569";
  const requestedTab = firstSearchValue(resolvedSearchParams, "tab");
  const selectedTab: StudentTab = requestedTab === "short" ? "short" : "regular";

  const regularRowsForYear = regularEnrollments.filter((row) => row.academic_year === selectedYear);
  const shortRowsForYear = shortCourses.filter((row) => row.academic_year === selectedYear);
  const departmentsForRegular = uniqueSorted(regularRowsForYear.map((row) => row.department_name));
  const departmentsForShort = uniqueSorted(shortRowsForYear.map((row) => row.department_name));
  const activeDepartmentList = selectedTab === "short" ? departmentsForShort : departmentsForRegular;
  const requestedDepartment = firstSearchValue(resolvedSearchParams, "department");
  const selectedDepartment =
    requestedDepartment && activeDepartmentList.includes(requestedDepartment) ? requestedDepartment : undefined;
  const visibleRegularRows = selectedDepartment
    ? regularRowsForYear.filter((row) => row.department_name === selectedDepartment)
    : regularRowsForYear;
  const visibleShortRows = selectedDepartment
    ? shortRowsForYear.filter((row) => row.department_name === selectedDepartment)
    : shortRowsForYear;
  const crudRowsById = new Map((crudRows ?? []).map((row) => [row.id, row]));
  const shortCrudRowsById = new Map((shortCrudRows ?? []).map((row) => [row.id, row]));
  const departmentHrefByName = new Map(catalog.map((department) => [normalizeDepartmentName(department.name), department.href]));

  const regularActualTotal = regularRowsForYear.reduce((sum, row) => sum + actualStudentCount(row), 0);
  const regularRosterTotal = regularRowsForYear.reduce((sum, row) => sum + Number(row.student_count ?? 0), 0);
  const regularUnregisteredTotal = regularRowsForYear.reduce((sum, row) => sum + Number(row.unregistered_count ?? 0), 0);
  const shortLearnerTotal = shortRowsForYear.reduce((sum, row) => sum + Number(row.learner_count ?? 0), 0);
  const shortCompletedTotal = shortRowsForYear.reduce((sum, row) => sum + Number(row.completed_count ?? 0), 0);
  const reportDate = formatThaiDate(regularRowsForYear.find((row) => row.report_date)?.report_date);
  const visibleRegularActual = visibleRegularRows.reduce((sum, row) => sum + actualStudentCount(row), 0);
  const visibleShortLearners = visibleShortRows.reduce((sum, row) => sum + Number(row.learner_count ?? 0), 0);
  const levelTotals = uniqueSorted(regularRowsForYear.map((row) => row.level_label))
    .map((level) => ({
      level,
      total: regularRowsForYear
        .filter((row) => row.level_label === level)
        .reduce((sum, row) => sum + actualStudentCount(row), 0),
      roster: regularRowsForYear
        .filter((row) => row.level_label === level)
        .reduce((sum, row) => sum + Number(row.student_count ?? 0), 0),
    }))
    .sort((left, right) => levelSortWeight(left.level) - levelSortWeight(right.level));

  return (
    <SiteShell active="students" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section id="student-data" className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading
          title="ข้อมูลผู้เรียน"
          description="สรุปจำนวนนักเรียน นักศึกษา และผู้เรียนหลักสูตรระยะสั้น แยกตามปีการศึกษา ระดับ แผนกวิชา และรายวิชา พร้อมระบบจัดการย้อนหลังในหลังบ้าน"
          action={
            <div className="flex flex-wrap gap-2">
              {enrollmentConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={enrollmentConfig.permission}
                  moduleKey={enrollmentConfig.key}
                  moduleLabel={enrollmentConfig.label}
                  fields={enrollmentConfig.fields}
                  label="เพิ่ม ปวช./ปวส."
                  adminHref="/admin/modules/student_enrollments"
                />
              ) : null}
              {shortCourseConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={shortCourseConfig.permission}
                  moduleKey={shortCourseConfig.key}
                  moduleLabel={shortCourseConfig.label}
                  fields={shortCourseConfig.fields}
                  label="เพิ่มหลักสูตรระยะสั้น"
                  adminHref="/admin/modules/short_course_enrollments"
                />
              ) : null}
            </div>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-blue-100 bg-blue-700 p-4 text-white shadow-sm">
            <span className="flex items-center gap-2 text-xs font-semibold text-blue-100">
              <UsersRound className="size-4" />
              ผู้เรียนรวมปี {selectedYear}
            </span>
            <strong className="mt-2 block text-3xl">{toThaiNumber(regularActualTotal + shortLearnerTotal)}</strong>
            <span className="text-sm text-blue-100">รวม ปวช./ปวส. และระยะสั้น</span>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
            <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <GraduationCap className="size-4" />
              ปวช./ปวส.
            </span>
            <strong className="mt-2 block text-3xl text-slate-950">{toThaiNumber(regularActualTotal)}</strong>
            <span className="text-sm text-slate-500">มีตัวตนจริงจากทั้งหมด {toThaiNumber(regularRosterTotal)} คน</span>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
            <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Clock3 className="size-4" />
              หลักสูตรระยะสั้น
            </span>
            <strong className="mt-2 block text-3xl text-slate-950">{toThaiNumber(shortLearnerTotal)}</strong>
            <span className="text-sm text-slate-500">สำเร็จแล้ว {toThaiNumber(shortCompletedTotal)} คน</span>
          </div>
          <div className="rounded-lg border border-blue-100 bg-sky-50 p-4 shadow-sm shadow-blue-950/5">
            <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Filter className="size-4" />
              มุมมองปัจจุบัน
            </span>
            <strong className="mt-2 block text-2xl text-slate-950">
              {toThaiNumber(selectedTab === "short" ? visibleShortLearners : visibleRegularActual)}
            </strong>
            <span className="line-clamp-1 text-sm text-slate-500">{selectedDepartment ?? "ภาพรวมทุกแผนก"}</span>
          </div>
        </div>

        <section className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-normal text-slate-950">เลือกปีการศึกษาและรูปแบบรายงาน</h2>
              <p className="mt-1 text-sm text-slate-600">
                ใช้ดูข้อมูลย้อนหลัง เลือกเฉพาะแผนกที่ต้องการ หรือสลับไปดูหลักสูตรระยะสั้นแบบรายวิชา
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableYears.map((year) => (
                <Button key={year} asChild size="sm" variant={year === selectedYear ? "default" : "outline"}>
                  <Link href={buildStudentHref({ year, tab: selectedTab, department: selectedDepartment })}>
                    <CalendarDays data-icon="inline-start" />
                    {year}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant={selectedTab === "regular" ? "default" : "outline"}>
              <Link href={buildStudentHref({ year: selectedYear, tab: "regular" })}>นักเรียน ปวช./ปวส.</Link>
            </Button>
            <Button asChild size="sm" variant={selectedTab === "short" ? "default" : "outline"}>
              <Link href={buildStudentHref({ year: selectedYear, tab: "short" })}>หลักสูตรระยะสั้นรายวิชา</Link>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant={!selectedDepartment ? "secondary" : "outline"}>
              <Link href={buildStudentHref({ year: selectedYear, tab: selectedTab })}>ภาพรวม</Link>
            </Button>
            {activeDepartmentList.map((department) => (
              <Button key={department} asChild size="sm" variant={department === selectedDepartment ? "secondary" : "outline"}>
                <Link href={buildStudentHref({ year: selectedYear, tab: selectedTab, department })}>{department}</Link>
              </Button>
            ))}
          </div>
        </section>

        {selectedTab === "regular" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {levelTotals.map((item) => (
                <div key={item.level} className="rounded-lg border border-blue-100 bg-sky-50 p-4">
                  <span className="text-xs font-semibold text-blue-700">ระดับ {item.level}</span>
                  <strong className="mt-1 block text-2xl text-slate-950">{toThaiNumber(item.total)} คน</strong>
                  <span className="text-xs text-slate-500">จากบัญชีรายชื่อ {toThaiNumber(item.roster)} คน</span>
                </div>
              ))}
            </div>

            <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-950/5">
              <div className="flex flex-col gap-2 border-b border-blue-100 bg-sky-50 px-4 py-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">ตารางรายงานนักเรียน นักศึกษา ปวช./ปวส.</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    ปีการศึกษา {selectedYear}
                    {reportDate ? ` อ้างอิงรายงานวันที่ ${reportDate}` : ""}
                    {selectedDepartment ? ` เฉพาะ${selectedDepartment}` : " ภาพรวมทุกระดับและทุกแผนก"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{visibleRegularRows.length.toLocaleString("th-TH")} รายการ</Badge>
                  <Badge variant="outline">ไม่ลงทะเบียน {toThaiNumber(regularUnregisteredTotal)} คน</Badge>
                </div>
              </div>

              <div className="hidden grid-cols-[minmax(260px,1fr)_92px_92px_92px_92px_92px_92px_128px] gap-3 border-b bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 lg:grid">
                <span>แผนกวิชา / ระดับ</span>
                <span className="text-right">ทั้งหมด</span>
                <span className="text-right">มีตัวตนจริง</span>
                <span className="text-right">ลงทะเบียน</span>
                <span className="text-right">ไม่ลงทะเบียน</span>
                <span className="text-right">เรียนซ้ำ</span>
                <span className="text-right">เก็บรายวิชา</span>
                <span className="text-right">การจัดการ</span>
              </div>

              <div className="divide-y divide-blue-100">
                {visibleRegularRows.map((row) => {
                  const crudRow = row.id > 0 ? crudRowsById.get(row.id) : undefined;
                  const departmentHref = departmentHrefByName.get(normalizeDepartmentName(row.department_name));

                  return (
                    <div
                      key={`${row.id}-${row.department_name}-${row.level_label}`}
                      className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(260px,1fr)_92px_92px_92px_92px_92px_92px_128px] lg:items-center"
                    >
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

                      <span className="text-right text-sm text-slate-700">
                        <span className="lg:hidden">ทั้งหมด </span>
                        {toThaiNumber(row.student_count)}
                      </span>
                      <strong className="text-right text-xl text-blue-700">
                        <span className="text-sm font-normal text-slate-500 lg:hidden">มีตัวตนจริง </span>
                        {toThaiNumber(actualStudentCount(row))}
                      </strong>
                      <span className="text-right text-sm text-slate-700">
                        <span className="lg:hidden">ลงทะเบียน </span>
                        {valueOrDash(row.registered_count)}
                      </span>
                      <span className="text-right text-sm text-slate-700">
                        <span className="lg:hidden">ไม่ลงทะเบียน </span>
                        {valueOrDash(row.unregistered_count)}
                      </span>
                      <span className="text-right text-sm text-slate-700">
                        <span className="lg:hidden">เรียนซ้ำ </span>
                        {valueOrDash(row.repeat_count)}
                      </span>
                      <span className="text-right text-sm text-slate-700">
                        <span className="lg:hidden">เก็บรายวิชา </span>
                        {valueOrDash(row.credit_collect_count)}
                      </span>

                      <div className="flex justify-start lg:justify-end">
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
          </>
        ) : (
          <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-950/5">
            <div className="flex flex-col gap-2 border-b border-blue-100 bg-sky-50 px-4 py-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">ตารางผู้เรียนหลักสูตรระยะสั้นรายวิชา</h2>
                <p className="mt-1 text-sm text-slate-600">
                  ปีการศึกษา {selectedYear}
                  {selectedDepartment ? ` เฉพาะ${selectedDepartment}` : " แสดงรายวิชา รุ่น/รอบเรียน ชั่วโมงเรียน และผลสำเร็จ"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{visibleShortRows.length.toLocaleString("th-TH")} รายวิชา</Badge>
                <Badge variant="outline">ผู้เรียน {toThaiNumber(visibleShortLearners)} คน</Badge>
              </div>
            </div>

            <div className="grid gap-3 border-b border-blue-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <Layers3 className="size-4" />
                  รายวิชา
                </span>
                <strong className="mt-1 block text-2xl text-slate-950">{toThaiNumber(visibleShortRows.length)}</strong>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <UsersRound className="size-4" />
                  ผู้เรียน
                </span>
                <strong className="mt-1 block text-2xl text-slate-950">{toThaiNumber(visibleShortLearners)}</strong>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <CheckCircle2 className="size-4" />
                  สำเร็จหลักสูตร
                </span>
                <strong className="mt-1 block text-2xl text-slate-950">
                  {toThaiNumber(visibleShortRows.reduce((sum, row) => sum + Number(row.completed_count ?? 0), 0))}
                </strong>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <span className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <Award className="size-4" />
                  ใบประกาศ
                </span>
                <strong className="mt-1 block text-2xl text-slate-950">
                  {toThaiNumber(visibleShortRows.reduce((sum, row) => sum + Number(row.certificate_count ?? 0), 0))}
                </strong>
              </div>
            </div>

            <div className="hidden grid-cols-[minmax(300px,1fr)_100px_140px_110px_130px_128px] gap-3 border-b bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 lg:grid">
              <span>รายวิชา / ฝ่ายงาน</span>
              <span className="text-right">ชั่วโมง</span>
              <span>รุ่น/ช่วงเรียน</span>
              <span className="text-right">ผู้เรียน</span>
              <span className="text-right">สำเร็จ / ใบประกาศ</span>
              <span className="text-right">การจัดการ</span>
            </div>

            {visibleShortRows.length ? (
              <div className="divide-y divide-blue-100">
                {visibleShortRows.map((row) => {
                  const crudRow = shortCrudRowsById.get(row.id);
                  const dateRange =
                    row.start_date || row.end_date
                      ? [formatThaiDate(row.start_date), formatThaiDate(row.end_date)].filter(Boolean).join(" - ")
                      : null;

                  return (
                    <div
                      key={`${row.id}-${row.course_name}`}
                      className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(300px,1fr)_100px_140px_110px_130px_128px] lg:items-center"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                          <Clock3 className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <strong className="text-base text-slate-950">{row.course_name}</strong>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                            {row.department_name ? <Badge variant="outline">{row.department_name}</Badge> : null}
                            {row.term_label ? <Badge variant="secondary">{row.term_label}</Badge> : null}
                            {row.instructor_name ? <span>ผู้สอน: {row.instructor_name}</span> : null}
                          </div>
                          {row.note ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{row.note}</p> : null}
                        </div>
                      </div>

                      <span className="text-right text-sm text-slate-700">
                        <span className="lg:hidden">ชั่วโมง </span>
                        {valueOrDash(row.hours)}
                      </span>
                      <span className="text-sm text-slate-700">{row.batch_label ?? dateRange ?? "-"}</span>
                      <strong className="text-right text-xl text-blue-700">
                        <span className="text-sm font-normal text-slate-500 lg:hidden">ผู้เรียน </span>
                        {toThaiNumber(row.learner_count)}
                      </strong>
                      <span className="text-right text-sm text-slate-700">
                        {valueOrDash(row.completed_count)} / {valueOrDash(row.certificate_count)}
                      </span>

                      <div className="flex justify-start lg:justify-end">
                        {shortCourseConfig && crudRow ? (
                          <AdminCrudTools
                            user={adminUser}
                            permission={shortCourseConfig.permission}
                            moduleKey={shortCourseConfig.key}
                            moduleLabel={shortCourseConfig.label}
                            fields={shortCourseConfig.fields}
                            row={crudRow}
                            label="จัดการ"
                            triggerSize="sm"
                            adminHref="/admin/modules/short_course_enrollments"
                            afterDeleteHref="/admin/modules/short_course_enrollments"
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <Table2 className="size-6" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">ยังไม่มีข้อมูลหลักสูตรระยะสั้นในปีนี้</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    เอกสารที่แนบมามีรายละเอียด ปวช./ปวส. แล้ว ส่วนระยะสั้นสามารถเพิ่มเป็นรายวิชาได้จากหลังบ้าน
                  </p>
                </div>
                {shortCourseConfig ? (
                  <AdminCrudCreateButton
                    user={adminUser}
                    permission={shortCourseConfig.permission}
                    moduleKey={shortCourseConfig.key}
                    moduleLabel={shortCourseConfig.label}
                    fields={shortCourseConfig.fields}
                    label="เพิ่มข้อมูลระยะสั้น"
                    adminHref="/admin/modules/short_course_enrollments"
                  />
                ) : null}
              </div>
            )}
          </section>
        )}
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
