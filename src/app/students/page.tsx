import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { AdminInlineTools } from "@/components/public/admin-inline-tools";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { queryRows } from "@/lib/db";
import { getSiteOverview } from "@/lib/site-data";
import { StudentReportActions } from "./student-report-actions";

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

type SearchParams = Record<string, string | string[] | undefined>;
type StudentTab = "regular" | "short";
type RegularMetric = "student_count" | "actual_count" | "registered_count";

type PivotRow = {
  department: string;
  branch: string;
  p1: number;
  p2: number;
  p3: number;
  pvcTotal: number;
  s1: number;
  s2: number;
  pvsTotal: number;
  total: number;
  rows: RawStudentEnrollment[];
};

type LevelTotal = {
  key: "p1" | "p2" | "p3" | "s1" | "s2";
  label: string;
  total: number;
};

const fallbackRegularRows: RawStudentEnrollment[] = [
  ["ปวช.1", "ช่างยนต์", 17, 11],
  ["ปวช.2", "ช่างยนต์", 10, 12],
  ["ปวช.3", "ช่างยนต์", 2, 13],
  ["ปวช.1", "ช่างกลโรงงาน", 11, 21],
  ["ปวช.2", "ช่างกลโรงงาน", 7, 22],
  ["ปวช.3", "ช่างกลโรงงาน", 7, 23],
  ["ปวช.1", "ไฟฟ้ากำลัง", 18, 31],
  ["ปวช.2", "ไฟฟ้ากำลัง", 20, 32],
  ["ปวช.3", "ไฟฟ้ากำลัง", 13, 33],
  ["ปวส.1", "ไฟฟ้ากำลัง", 36, 34],
  ["ปวส.2", "ไฟฟ้ากำลัง", 24, 35],
  ["ปวช.2", "อิเล็กทรอนิกส์", 20, 41],
  ["ปวช.3", "อิเล็กทรอนิกส์", 2, 42],
  ["ปวส.1", "อิเล็กทรอนิกส์", 6, 43],
  ["ปวช.1", "การบัญชี", 10, 51],
  ["ปวช.3", "การบัญชี", 1, 52],
  ["ปวส.1", "การบัญชี", 47, 53],
  ["ปวส.2", "การบัญชี", 20, 54],
  ["ปวช.1", "อาหารและโภชนาการ", 8, 61],
  ["ปวช.2", "อาหารและโภชนาการ", 18, 62],
  ["ปวช.3", "อาหารและโภชนาการ", 2, 63],
  ["ปวส.1", "อาหารและโภชนาการ", 28, 64],
  ["ปวส.2", "อาหารและโภชนาการ", 16, 65],
  ["ปวช.1", "คอมพิวเตอร์ธุรกิจ", 14, 71],
  ["ปวช.2", "คอมพิวเตอร์ธุรกิจ", 15, 72],
  ["ปวช.3", "คอมพิวเตอร์ธุรกิจ", 5, 73],
  ["ปวส.1", "เทคโนโลยีธุรกิจดิจิทัล", 33, 74],
  ["ปวส.2", "เทคโนโลยีธุรกิจดิจิทัล", 19, 75],
  ["ปวส.1", "เทคนิคเครื่องกล", 17, 81],
  ["ปวส.2", "เทคนิคเครื่องกล", 15, 82],
  ["ปวส.1", "เทคนิคการผลิต", 18, 91],
  ["ปวส.2", "เทคนิคการผลิต", 12, 92],
].map(([level, department, count, sort], index) => ({
  id: -(index + 1),
  academic_year: "2569",
  report_date: "2026-06-24",
  level_label: String(level),
  department_name: String(department),
  student_count: Number(count),
  registered_count: Number(count),
  unregistered_count: 0,
  repeat_count: 0,
  credit_collect_count: 0,
  actual_count: Number(count),
  male_count: null,
  female_count: null,
  note: "ข้อมูลตั้งต้นจากเอกสารรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569",
  sort_order: Number(sort),
  status: "active",
}));

function firstSearchValue(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function toThaiNumber(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString("th-TH");
}

function valueCell(value: number): string {
  return value > 0 ? toThaiNumber(value) : "-";
}

function compareAcademicYearDesc(left: string, right: string): number {
  return right.localeCompare(left, "th-TH", { numeric: true });
}

function formatThaiDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeForCompare(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

function departmentGroupName(value: string): string {
  const compact = normalizeForCompare(value);

  if (compact.includes("ช่างยนต์")) return "ช่างยนต์";
  if (compact.includes("ช่างกลโรงงาน")) return "ช่างกลโรงงาน";
  if (compact.includes("ไฟฟ้า")) return "ไฟฟ้ากำลัง";
  if (compact.includes("อิเล็กทรอนิกส์")) return "อิเล็กทรอนิกส์";
  if (compact.includes("บัญชี")) return "การบัญชี";
  if (compact.includes("อาหาร")) return "อาหารและโภชนาการ";
  if (compact.includes("คอมพิวเตอร์ธุรกิจ")) return "คอมพิวเตอร์ธุรกิจ";
  if (compact.includes("ธุรกิจดิจิทัล")) return "เทคโนโลยีธุรกิจดิจิทัล";
  if (compact.includes("เทคนิคเครื่องกล")) return "เทคนิคเครื่องกล";
  if (compact.includes("เทคนิคการผลิต")) return "เทคนิคการผลิต";

  return value
    .replace(/\d+\/\d+/g, "")
    .replace(/ทวิ|สมทบ|สายตรง|สาย\s*ม\.6|ม\.6/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function branchLabelForDepartment(department: string): string {
  if (department === "ไฟฟ้ากำลัง") return "ไฟฟ้ากำลัง / ไฟฟ้า";
  if (department === "เทคโนโลยีธุรกิจดิจิทัล") return "เทคโนโลยีธุรกิจดิจิทัล / ธุรกิจดิจิทัล";
  if (department === "เทคนิคเครื่องกล") return "เทคนิคเครื่องกล / เทคนิคเครื่องมือกล";
  return department;
}

function levelKey(value: string): keyof Omit<PivotRow, "department" | "branch" | "pvcTotal" | "pvsTotal" | "total" | "rows"> | null {
  const compact = normalizeForCompare(value);

  if (compact.includes("ปวช.1")) return "p1";
  if (compact.includes("ปวช.2")) return "p2";
  if (compact.includes("ปวช.3")) return "p3";
  if (compact.includes("ปวส.1")) return "s1";
  if (compact.includes("ปวส.2")) return "s2";

  return null;
}

function valueForMetric(row: RawStudentEnrollment, metric: RegularMetric): number {
  if (metric === "actual_count") return Number(row.actual_count ?? row.student_count ?? 0);
  if (metric === "registered_count") return Number(row.registered_count ?? 0);
  return Number(row.student_count ?? 0);
}

function buildPivotRows(rows: RawStudentEnrollment[], metric: RegularMetric): PivotRow[] {
  const byDepartment = new Map<string, PivotRow>();

  for (const row of rows) {
    const department = departmentGroupName(row.department_name);
    const key = levelKey(row.level_label);
    if (!key) continue;

    const current =
      byDepartment.get(department) ??
      ({
        department,
        branch: branchLabelForDepartment(department),
        p1: 0,
        p2: 0,
        p3: 0,
        pvcTotal: 0,
        s1: 0,
        s2: 0,
        pvsTotal: 0,
        total: 0,
        rows: [],
      } satisfies PivotRow);

    current[key] += valueForMetric(row, metric);
    current.rows.push(row);
    byDepartment.set(department, current);
  }

  return Array.from(byDepartment.values())
    .map((row) => ({
      ...row,
      pvcTotal: row.p1 + row.p2 + row.p3,
      pvsTotal: row.s1 + row.s2,
      total: row.p1 + row.p2 + row.p3 + row.s1 + row.s2,
    }))
    .sort((left, right) => left.department.localeCompare(right.department, "th-TH"));
}

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((left, right) =>
    left.localeCompare(right, "th-TH")
  );
}

function buildHref(options: {
  year: string;
  tab?: StudentTab;
  metric?: RegularMetric;
  q?: string;
  level?: string;
  department?: string;
  focus?: string;
}): string {
  const params = new URLSearchParams();
  params.set("year", options.year);

  if (options.tab && options.tab !== "regular") params.set("tab", options.tab);
  if (options.metric && options.metric !== "student_count") params.set("metric", options.metric);
  if (options.q) params.set("q", options.q);
  if (options.level && options.level !== "all") params.set("level", options.level);
  if (options.department && options.department !== "all") params.set("department", options.department);
  if (options.focus) params.set("focus", options.focus);

  return `/students?${params.toString()}#student-data`;
}

function csvHref(rows: PivotRow[]): string {
  const header = ["แผนก", "สาขาวิชา", "ปวช.1", "ปวช.2", "ปวช.3", "รวม ปวช.", "ปวส.1", "ปวส.2", "รวม ปวส.", "รวมทั้งหมด"];
  const body = rows.map((row) => [
    row.department,
    row.branch,
    row.p1,
    row.p2,
    row.p3,
    row.pvcTotal,
    row.s1,
    row.s2,
    row.pvsTotal,
    row.total,
  ]);
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(csv)}`;
}

function statCard(title: string, value: number, caption: string, badge: string, tone: "blue" | "orange" | "green" | "slate") {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
  }[tone];

  return (
    <div className="relative overflow-hidden rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5">
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <Badge className={`${toneClass} rounded-full border-0 px-4 py-1`}>{badge}</Badge>
      </div>
      <strong className="mt-5 block text-4xl font-semibold tracking-normal text-slate-950">{toThaiNumber(value)}</strong>
      <p className="mt-3 text-sm leading-5 text-slate-500">{caption}</p>
    </div>
  );
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

  const regularRows = enrollmentRows?.length ? enrollmentRows : fallbackRegularRows;
  const shortRows = shortCourseRows ?? [];
  const availableYears = Array.from(new Set([...regularRows.map((row) => row.academic_year), ...shortRows.map((row) => row.academic_year)])).sort(compareAcademicYearDesc);
  const selectedYear = firstSearchValue(resolvedSearchParams, "year") ?? availableYears[0] ?? "2569";
  const selectedTab: StudentTab = firstSearchValue(resolvedSearchParams, "tab") === "short" ? "short" : "regular";
  const selectedMetric = (["student_count", "actual_count", "registered_count"].includes(firstSearchValue(resolvedSearchParams, "metric") ?? "")
    ? firstSearchValue(resolvedSearchParams, "metric")
    : "student_count") as RegularMetric;
  const searchText = firstSearchValue(resolvedSearchParams, "q")?.trim() ?? "";
  const selectedLevel = firstSearchValue(resolvedSearchParams, "level") ?? "all";
  const selectedDepartment = firstSearchValue(resolvedSearchParams, "department") ?? "all";

  const yearRegularRows = regularRows.filter((row) => row.academic_year === selectedYear);
  const yearShortRows = shortRows.filter((row) => row.academic_year === selectedYear);
  const departmentOptions = uniqueSorted(yearRegularRows.map((row) => departmentGroupName(row.department_name)));
  const shortDepartmentOptions = uniqueSorted(yearShortRows.map((row) => row.department_name));
  const filteredRegularRows = yearRegularRows.filter((row) => {
    const department = departmentGroupName(row.department_name);
    const level = levelKey(row.level_label);
    const matchesSearch =
      !searchText ||
      normalizeForCompare(department).includes(normalizeForCompare(searchText)) ||
      normalizeForCompare(row.department_name).includes(normalizeForCompare(searchText));
    const matchesLevel = selectedLevel === "all" || level === selectedLevel;
    const matchesDepartment = selectedDepartment === "all" || department === selectedDepartment;

    return matchesSearch && matchesLevel && matchesDepartment;
  });
  const filteredShortRows = yearShortRows.filter((row) => {
    const matchesSearch =
      !searchText ||
      normalizeForCompare(row.course_name).includes(normalizeForCompare(searchText)) ||
      normalizeForCompare(row.department_name ?? "").includes(normalizeForCompare(searchText));
    const matchesDepartment = selectedDepartment === "all" || row.department_name === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });
  const pivotRows = buildPivotRows(filteredRegularRows, selectedMetric);
  const allPivotRowsForYear = buildPivotRows(yearRegularRows, selectedMetric);
  const focusedDepartment = firstSearchValue(resolvedSearchParams, "focus") ?? pivotRows.find((row) => row.total > 0)?.department;
  const focusedRow = pivotRows.find((row) => row.department === focusedDepartment) ?? pivotRows[0];
  const crudRowsById = new Map((crudRows ?? []).map((row) => [row.id, row]));
  const shortCrudRowsById = new Map((shortCrudRows ?? []).map((row) => [row.id, row]));

  const levelTotals: LevelTotal[] = [
    { key: "p1", label: "ปวช.1", total: allPivotRowsForYear.reduce((sum, row) => sum + row.p1, 0) },
    { key: "p2", label: "ปวช.2", total: allPivotRowsForYear.reduce((sum, row) => sum + row.p2, 0) },
    { key: "p3", label: "ปวช.3", total: allPivotRowsForYear.reduce((sum, row) => sum + row.p3, 0) },
    { key: "s1", label: "ปวส.1", total: allPivotRowsForYear.reduce((sum, row) => sum + row.s1, 0) },
    { key: "s2", label: "ปวส.2", total: allPivotRowsForYear.reduce((sum, row) => sum + row.s2, 0) },
  ];
  const totalRegular = levelTotals.reduce((sum, row) => sum + row.total, 0);
  const totalPvc = levelTotals.slice(0, 3).reduce((sum, row) => sum + row.total, 0);
  const totalPvs = levelTotals.slice(3).reduce((sum, row) => sum + row.total, 0);
  const totalShort = filteredShortRows.reduce((sum, row) => sum + Number(row.learner_count ?? 0), 0);
  const reportDate = formatThaiDate(yearRegularRows.find((row) => row.report_date)?.report_date);
  const exportHref = csvHref(pivotRows);

  return (
    <SiteShell active="students" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <div className="bg-[#eef5fc]">
        <section id="student-data" className="mx-auto flex max-w-[1480px] flex-col gap-5 px-4 py-7 md:px-8">
          <div className="rounded-lg bg-[linear-gradient(120deg,#1748b3,#1169b7_56%,#178879)] p-7 text-white shadow-sm shadow-blue-950/15">
            <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-center">
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-2xl font-semibold">
                  SPC
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-normal">ระบบรายงานจำนวนนักเรียน นักศึกษา</h1>
                  <p className="mt-2 text-sm leading-6 text-blue-50">
                    วิทยาลัยสารพัดช่างสุรินทร์ · ภาคเรียนที่ 1/{selectedYear} · Public View แสดงเฉพาะจำนวนรวม
                    {reportDate ? ` · ข้อมูลวันที่ ${reportDate}` : null}
                  </p>
                </div>
              </div>
              <StudentReportActions exportHref={exportHref} />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCard("นักเรียน นักศึกษาทั้งหมด", totalRegular + totalShort, "รวม ปวช. และ ปวส. ทุกชั้นปี", "รวมทุกระดับ", "blue")}
            {statCard("ระดับ ปวช.", totalPvc, "แสดงเป็นจำนวนรวมของระดับประกาศนียบัตรวิชาชีพ", "ปวช. 1-3", "orange")}
            {statCard("ระดับ ปวส.", totalPvs, "แสดงเป็นจำนวนรวมของระดับประกาศนียบัตรวิชาชีพชั้นสูง", "ปวส. 1-2", "green")}
            {statCard("ระดับชั้นที่แสดง", levelTotals.filter((item) => item.total > 0).length, "ปวช.1, ปวช.2, ปวช.3, ปวส.1 และ ปวส.2", "Public", "slate")}
          </div>

          <form action="/students" className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm shadow-blue-950/5">
            <input type="hidden" name="tab" value={selectedTab} />
            <input type="hidden" name="metric" value={selectedMetric} />
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.5fr)_160px_160px_170px_minmax(220px,1.2fr)_110px]">
              <label className="flex h-11 items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 text-sm text-slate-500">
                <Search className="size-4 text-blue-500" />
                <input name="q" defaultValue={searchText} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="ค้นหาแผนก / สาขาวิชา / ชั้นปี" />
              </label>
              <select name="year" defaultValue={selectedYear} className="h-11 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none">
                {availableYears.map((year) => (
                  <option key={year} value={year}>ปี {year}</option>
                ))}
              </select>
              <select name="term" defaultValue="1" className="h-11 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none">
                <option value="1">ภาคเรียน 1</option>
                <option value="2">ภาคเรียน 2</option>
              </select>
              <select name="level" defaultValue={selectedLevel} className="h-11 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none">
                <option value="all">ทุกระดับ</option>
                <option value="p1">ปวช.1</option>
                <option value="p2">ปวช.2</option>
                <option value="p3">ปวช.3</option>
                <option value="s1">ปวส.1</option>
                <option value="s2">ปวส.2</option>
              </select>
              <select name="department" defaultValue={selectedDepartment} className="h-11 rounded-lg border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none">
                <option value="all">ทุกแผนก / สาขาวิชา</option>
                {(selectedTab === "short" ? shortDepartmentOptions : departmentOptions).map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
              <Button type="submit" variant="outline" className="h-11">
                <Filter data-icon="inline-start" />
                ตัวกรอง
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant={selectedTab === "regular" ? "default" : "outline"}>
              <Link href={buildHref({ year: selectedYear, metric: selectedMetric })}>นักเรียน ปวช./ปวส.</Link>
            </Button>
            <Button asChild size="sm" variant={selectedTab === "short" ? "default" : "outline"}>
              <Link href={buildHref({ year: selectedYear, tab: "short", metric: selectedMetric })}>หลักสูตรระยะสั้น</Link>
            </Button>
            <Button asChild size="sm" variant={selectedMetric === "student_count" ? "secondary" : "outline"}>
              <Link href={buildHref({ year: selectedYear, tab: selectedTab, q: searchText, level: selectedLevel, department: selectedDepartment, metric: "student_count" })}>
                จำนวนรวม
              </Link>
            </Button>
            <Button asChild size="sm" variant={selectedMetric === "actual_count" ? "secondary" : "outline"}>
              <Link href={buildHref({ year: selectedYear, tab: selectedTab, q: searchText, level: selectedLevel, department: selectedDepartment, metric: "actual_count" })}>
                มีตัวตนจริง
              </Link>
            </Button>
            <Button asChild size="sm" variant={selectedMetric === "registered_count" ? "secondary" : "outline"}>
              <Link href={buildHref({ year: selectedYear, tab: selectedTab, q: searchText, level: selectedLevel, department: selectedDepartment, metric: "registered_count" })}>
                ลงทะเบียนแล้ว
              </Link>
            </Button>
          </div>

          {selectedTab === "regular" ? (
            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-950/5">
                <div className="flex flex-col gap-3 border-b border-blue-100 px-5 py-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-normal text-slate-950">DataTable แบบ Pivot: แผนก / สาขาวิชา / ชั้นปี / รวม</h2>
                    <p className="mt-2 text-sm text-slate-500">ตารางหลักแสดงเฉพาะ “จำนวน” ไม่มีคอลัมน์สถานะภายในหรือข้อมูลเชิงลึก</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="rounded-full border-0 bg-blue-50 px-5 py-2 text-blue-700">จำนวนรวม</Badge>
                    <Badge className="rounded-full border-0 bg-slate-100 px-5 py-2 text-slate-500">แยกแผนก</Badge>
                    <Badge className="rounded-full border-0 bg-slate-100 px-5 py-2 text-slate-500">กราฟ</Badge>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-blue-100 bg-slate-50 text-left text-xs font-bold text-slate-600">
                        <th rowSpan={2} className="border-r border-blue-100 px-4 py-4">แผนก</th>
                        <th rowSpan={2} className="border-r border-blue-100 px-4 py-4">สาขาวิชา / สาขางาน</th>
                        <th colSpan={4} className="border-r border-blue-100 bg-blue-50 px-4 py-3 text-center text-blue-700">ระดับ ปวช.</th>
                        <th colSpan={3} className="border-r border-blue-100 bg-emerald-50 px-4 py-3 text-center text-emerald-700">ระดับ ปวส.</th>
                        <th rowSpan={2} className="px-4 py-4 text-center">รวมทั้งหมด</th>
                      </tr>
                      <tr className="border-b border-blue-100 bg-slate-50 text-xs font-bold">
                        <th className="bg-blue-50 px-3 py-3 text-center text-blue-700">ปวช.1</th>
                        <th className="bg-blue-50 px-3 py-3 text-center text-blue-700">ปวช.2</th>
                        <th className="bg-blue-50 px-3 py-3 text-center text-blue-700">ปวช.3</th>
                        <th className="border-r border-blue-100 bg-amber-50 px-3 py-3 text-center text-amber-700">รวม ปวช.</th>
                        <th className="bg-emerald-50 px-3 py-3 text-center text-emerald-700">ปวส.1</th>
                        <th className="bg-emerald-50 px-3 py-3 text-center text-emerald-700">ปวส.2</th>
                        <th className="border-r border-blue-100 bg-amber-50 px-3 py-3 text-center text-amber-700">รวม ปวส.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pivotRows.map((row) => (
                        <tr key={row.department} className="border-b border-blue-50 text-slate-700 hover:bg-blue-50/60">
                          <td className="border-r border-blue-50 px-4 py-3 font-bold text-slate-950">{row.department}</td>
                          <td className="border-r border-blue-50 px-4 py-3">
                            <Link href={buildHref({ year: selectedYear, metric: selectedMetric, q: searchText, level: selectedLevel, department: selectedDepartment, focus: row.department })} className="font-medium hover:text-blue-700 hover:underline">
                              {row.branch}
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-center">{valueCell(row.p1)}</td>
                          <td className="px-3 py-3 text-center">{valueCell(row.p2)}</td>
                          <td className="px-3 py-3 text-center">{valueCell(row.p3)}</td>
                          <td className="border-r border-blue-50 bg-amber-50/70 px-3 py-3 text-center font-semibold text-amber-700">{valueCell(row.pvcTotal)}</td>
                          <td className="px-3 py-3 text-center">{valueCell(row.s1)}</td>
                          <td className="px-3 py-3 text-center">{valueCell(row.s2)}</td>
                          <td className="border-r border-blue-50 bg-amber-50/70 px-3 py-3 text-center font-semibold text-amber-700">{valueCell(row.pvsTotal)}</td>
                          <td className="bg-blue-50/70 px-3 py-3 text-center font-bold text-blue-700">{valueCell(row.total)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-950 text-white">
                        <td className="border-r border-slate-700 px-4 py-3 font-bold">รวมทุกแผนก</td>
                        <td className="border-r border-slate-700 px-4 py-3">รวมทุกสาขาวิชา</td>
                        <td className="px-3 py-3 text-center">{toThaiNumber(levelTotals[0]?.total)}</td>
                        <td className="px-3 py-3 text-center">{toThaiNumber(levelTotals[1]?.total)}</td>
                        <td className="px-3 py-3 text-center">{toThaiNumber(levelTotals[2]?.total)}</td>
                        <td className="px-3 py-3 text-center">{toThaiNumber(totalPvc)}</td>
                        <td className="px-3 py-3 text-center">{toThaiNumber(levelTotals[3]?.total)}</td>
                        <td className="px-3 py-3 text-center">{toThaiNumber(levelTotals[4]?.total)}</td>
                        <td className="px-3 py-3 text-center">{toThaiNumber(totalPvs)}</td>
                        <td className="px-3 py-3 text-center font-bold">{toThaiNumber(totalRegular)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <aside className="flex flex-col gap-4">
                <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5">
                  <h3 className="text-lg font-bold tracking-normal text-slate-950">สรุปตามระดับชั้น</h3>
                  <div className="mt-5 flex flex-col gap-4">
                    {levelTotals.map((item) => {
                      const ratio = totalRegular > 0 ? Math.max(6, Math.round((item.total / totalRegular) * 100)) : 0;
                      return (
                        <div key={item.key} className="grid grid-cols-[64px_1fr_44px] items-center gap-3">
                          <span className="font-bold text-slate-900">{item.label}</span>
                          <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <span className="block h-full rounded-full bg-[linear-gradient(90deg,#1d4ed8,#0f766e)]" style={{ width: `${ratio}%` }} />
                          </span>
                          <span className="text-right text-sm text-slate-600">{toThaiNumber(item.total)}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5">
                  <h3 className="text-lg font-bold tracking-normal text-slate-950">ตัวอย่างรายละเอียดเมื่อคลิกแถว</h3>
                  {focusedRow ? (
                    <div className="mt-4 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between rounded-t-lg bg-blue-50 px-4 py-3">
                        <strong className="text-blue-700">{focusedRow.department}</strong>
                        <Link href={buildHref({ year: selectedYear, metric: selectedMetric, q: searchText, level: selectedLevel, department: selectedDepartment })} className="text-blue-700">
                          <X className="size-4" />
                        </Link>
                      </div>
                      <div className="px-4 py-4">
                        <p className="text-xs leading-5 text-slate-500">แสดงเฉพาะจำนวนรายระดับชั้นของแผนก/สาขาที่เลือก</p>
                        <table className="mt-4 w-full text-sm">
                          <thead className="bg-slate-50 text-left text-xs text-slate-500">
                            <tr>
                              <th className="px-3 py-3">ระดับชั้น</th>
                              <th className="px-3 py-3 text-right">จำนวน</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-50">
                            {[
                              ["ปวช.1", focusedRow.p1],
                              ["ปวช.2", focusedRow.p2],
                              ["ปวช.3", focusedRow.p3],
                              ["ปวส.1", focusedRow.s1],
                              ["ปวส.2", focusedRow.s2],
                            ].map(([label, value]) => (
                              <tr key={String(label)}>
                                <td className="px-3 py-3 text-slate-600">{label}</td>
                                <td className="px-3 py-3 text-right text-slate-700">{valueCell(Number(value))}</td>
                              </tr>
                            ))}
                            <tr className="font-bold">
                              <td className="px-3 py-3">รวม</td>
                              <td className="px-3 py-3 text-right">{toThaiNumber(focusedRow.total)}</td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {focusedRow.rows.map((row) => {
                            const crudRow = row.id > 0 ? crudRowsById.get(row.id) : undefined;
                            return crudRow && enrollmentConfig ? (
                              <AdminCrudTools
                                key={row.id}
                                user={adminUser}
                                permission={enrollmentConfig.permission}
                                moduleKey={enrollmentConfig.key}
                                moduleLabel={enrollmentConfig.label}
                                fields={enrollmentConfig.fields}
                                row={crudRow}
                                label={`จัดการ ${row.level_label}`}
                                triggerSize="sm"
                                adminHref="/admin/modules/student_enrollments"
                                afterDeleteHref="/admin/modules/student_enrollments"
                              />
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลในตัวกรองนี้</p>
                  )}
                </section>
              </aside>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-950/5">
                <div className="flex flex-col gap-3 border-b border-blue-100 px-5 py-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-normal text-slate-950">DataTable หลักสูตรระยะสั้นรายวิชา</h2>
                    <p className="mt-2 text-sm text-slate-500">แสดงรายวิชา รุ่น ชั่วโมง ผู้เรียน ผู้สำเร็จ และจำนวนใบประกาศ รองรับการจัดการรายวิชาแบบ CRUD</p>
                  </div>
                  <Badge className="rounded-full border-0 bg-blue-50 px-5 py-2 text-blue-700">{filteredShortRows.length.toLocaleString("th-TH")} รายวิชา</Badge>
                </div>

                <div className="grid gap-3 border-b border-blue-100 bg-white p-4 md:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <FileSpreadsheet className="size-5 text-blue-700" />
                    <strong className="mt-2 block text-2xl text-slate-950">{toThaiNumber(filteredShortRows.length)}</strong>
                    <span className="text-sm text-slate-500">รายวิชา</span>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4">
                    <UsersRound className="size-5 text-blue-700" />
                    <strong className="mt-2 block text-2xl text-slate-950">{toThaiNumber(totalShort)}</strong>
                    <span className="text-sm text-slate-500">ผู้เรียน</span>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4">
                    <CheckCircle2 className="size-5 text-blue-700" />
                    <strong className="mt-2 block text-2xl text-slate-950">{toThaiNumber(filteredShortRows.reduce((sum, row) => sum + Number(row.completed_count ?? 0), 0))}</strong>
                    <span className="text-sm text-slate-500">สำเร็จหลักสูตร</span>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4">
                    <Award className="size-5 text-blue-700" />
                    <strong className="mt-2 block text-2xl text-slate-950">{toThaiNumber(filteredShortRows.reduce((sum, row) => sum + Number(row.certificate_count ?? 0), 0))}</strong>
                    <span className="text-sm text-slate-500">ใบประกาศ</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500">
                      <tr>
                        <th className="border-b border-blue-100 px-4 py-4">รายวิชา / หลักสูตร</th>
                        <th className="border-b border-blue-100 px-4 py-4">ฝ่ายงาน / แผนก</th>
                        <th className="border-b border-blue-100 px-4 py-4 text-right">ชั่วโมง</th>
                        <th className="border-b border-blue-100 px-4 py-4">รุ่น / ช่วงเรียน</th>
                        <th className="border-b border-blue-100 px-4 py-4 text-right">ผู้เรียน</th>
                        <th className="border-b border-blue-100 px-4 py-4 text-right">สำเร็จ</th>
                        <th className="border-b border-blue-100 px-4 py-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                      {filteredShortRows.map((row) => {
                        const crudRow = shortCrudRowsById.get(row.id);
                        const dateRange =
                          row.start_date || row.end_date
                            ? [formatThaiDate(row.start_date), formatThaiDate(row.end_date)].filter(Boolean).join(" - ")
                            : null;

                        return (
                          <tr key={row.id} className="hover:bg-blue-50/60">
                            <td className="px-4 py-4 font-bold text-slate-950">{row.course_name}</td>
                            <td className="px-4 py-4 text-slate-600">{row.department_name ?? "-"}</td>
                            <td className="px-4 py-4 text-right text-slate-700">{row.hours ? toThaiNumber(row.hours) : "-"}</td>
                            <td className="px-4 py-4 text-slate-600">{row.batch_label ?? row.term_label ?? dateRange ?? "-"}</td>
                            <td className="px-4 py-4 text-right font-bold text-blue-700">{toThaiNumber(row.learner_count)}</td>
                            <td className="px-4 py-4 text-right text-slate-700">{toThaiNumber(row.completed_count ?? 0)}</td>
                            <td className="px-4 py-4 text-right">
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
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {!filteredShortRows.length ? (
                  <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                    <Clock3 className="size-10 text-blue-700" />
                    <h3 className="mt-4 text-lg font-bold text-slate-950">ยังไม่มีข้อมูลหลักสูตรระยะสั้นในตัวกรองนี้</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">เพิ่มข้อมูลได้จากปุ่มด้านบน หรือเมนูหลังบ้าน “ผู้เรียนระยะสั้น” ระบบรองรับการกรอกย้อนหลังเป็นรายปีการศึกษาและรายวิชา</p>
                  </div>
                ) : null}
              </section>

              <aside className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5">
                <h3 className="text-lg font-bold text-slate-950">สรุปหลักสูตรระยะสั้น</h3>
                <div className="mt-5 flex flex-col gap-3">
                  {uniqueSorted(filteredShortRows.map((row) => row.department_name)).map((department) => {
                    const total = filteredShortRows
                      .filter((row) => row.department_name === department)
                      .reduce((sum, row) => sum + Number(row.learner_count ?? 0), 0);
                    return (
                      <div key={department} className="rounded-lg border border-blue-100 p-4">
                        <span className="text-sm font-bold text-slate-900">{department}</span>
                        <strong className="mt-2 block text-2xl text-blue-700">{toThaiNumber(total)}</strong>
                        <span className="text-xs text-slate-500">ผู้เรียน</span>
                      </div>
                    );
                  })}
                </div>
              </aside>
            </div>
          )}

          <section className="border-y border-blue-100 bg-transparent py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">บริการสำหรับผู้เรียน</h2>
                <p className="mt-1 text-sm text-slate-500">ช่องทางบริการออนไลน์ เอกสาร และระบบที่นักเรียน นักศึกษาต้องใช้บ่อย</p>
              </div>
              <AdminInlineTools
                user={adminUser}
                permission="cms.quick_links"
                module="quick_links"
                label="จัดการลิงก์ผู้เรียน"
              />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overview.quickLinks.slice(0, 6).map((link) => (
                <Link
                  key={link.itemKey}
                  href={link.href}
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
          </section>
        </section>
      </div>
    </SiteShell>
  );
}
