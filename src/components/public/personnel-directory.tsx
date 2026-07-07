import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  RotateCcw,
  Search,
  UserCog,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import type { AdminUser } from "@/lib/admin-auth";
import type { AdminCrudModuleConfig, AdminCrudRow, AdminCrudValue } from "@/lib/admin-crud-config";
import { publicAssetPath } from "@/lib/legacy-paths";
import { canAccess } from "@/lib/permissions";

export type PersonnelDirectoryProfile = {
  id: number;
  page_slug: string;
  section_title: string | null;
  full_name: string;
  position_title: string;
  department: string | null;
  committee_role: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_channel: string | null;
  term_period: string | null;
  photo_path: string | null;
  appointment_file: string | null;
  profile_note: string | null;
  sort_order: number;
  status: string;
};

export type PersonnelDirectorySummaryStat = {
  id: number;
  academic_year: string;
  personnel_type: string;
  department: string | null;
  staff_count: number;
  context_note: string | null;
  sort_order: number;
  status: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

type PersonnelDirectoryProps = {
  profiles: PersonnelDirectoryProfile[];
  summaryStats: PersonnelDirectorySummaryStat[];
  searchParams: SearchParams;
  user?: AdminUser | null;
  personnelConfig?: AdminCrudModuleConfig | null;
  personnelRows?: AdminCrudRow[] | null;
  summaryConfig?: AdminCrudModuleConfig | null;
  summaryRows?: AdminCrudRow[] | null;
};

const categoryMeta = [
  { key: "all", label: "ทั้งหมด", icon: UsersRound, className: "bg-blue-600 text-white", chip: "bg-blue-50 text-blue-700" },
  { key: "executive", label: "ผู้บริหาร", icon: UserCog, className: "bg-violet-600 text-white", chip: "bg-violet-50 text-violet-700" },
  { key: "teacher", label: "ข้าราชการครู", icon: GraduationCap, className: "bg-emerald-600 text-white", chip: "bg-emerald-50 text-emerald-700" },
  { key: "employee", label: "พนักงานราชการ", icon: BriefcaseBusiness, className: "bg-orange-500 text-white", chip: "bg-orange-50 text-orange-700" },
  { key: "staff", label: "เจ้าหน้าที่", icon: UserRound, className: "bg-cyan-600 text-white", chip: "bg-cyan-50 text-cyan-700" },
];

function firstValue(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/\s+/g, "");
}

function isActive(status?: string | null): boolean {
  return status === "active" || status === "published" || status === "1";
}

function initialText(name: string): string {
  return name.replace(/^[-\s]+/, "").trim().charAt(0) || "ส";
}

function personnelCategory(profile: PersonnelDirectoryProfile): string {
  const combined = normalize(
    [profile.section_title, profile.committee_role, profile.position_title, profile.department].filter(Boolean).join(" ")
  );

  if (combined.includes("ผู้บริหาร") || combined.includes("ผู้อำนวยการ") || combined.includes("รองผู้อำนวยการ")) {
    return "executive";
  }

  if (combined.includes("พนักงานราชการ")) {
    return "employee";
  }

  if (combined.includes("ครู") || combined.includes("อาจารย์") || combined.includes("ข้าราชการครู")) {
    return "teacher";
  }

  return "staff";
}

function summaryCount(summaryStats: PersonnelDirectorySummaryStat[], keywords: string[]): number {
  return summaryStats
    .filter((item) => keywords.some((keyword) => normalize(item.personnel_type).includes(normalize(keyword))))
    .reduce((sum, item) => sum + Number(item.staff_count ?? 0), 0);
}

function countCategory(
  activeProfiles: PersonnelDirectoryProfile[],
  currentSummary: PersonnelDirectorySummaryStat[],
  category: string
): number {
  const profileCount = activeProfiles.filter((profile) => personnelCategory(profile) === category).length;

  if (category === "executive") {
    return summaryCount(currentSummary, ["ผู้บริหาร"]) || profileCount;
  }

  if (category === "teacher") {
    return summaryCount(currentSummary, ["ข้าราชการครู", "ครู", "อาจารย์"]) || profileCount;
  }

  if (category === "employee") {
    return summaryCount(currentSummary, ["พนักงานราชการ"]) || profileCount;
  }

  return summaryCount(currentSummary, ["เจ้าหน้าที่", "ลูกจ้าง", "บุคลากรสนับสนุน"]) || profileCount;
}

function buildPath(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== "all") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `/content/personnel-data?${query}` : "/content/personnel-data";
}

function percent(value: number, total: number): number {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function categorySectionLabel(category: string): string {
  if (category === "teacher") return "ข้าราชการครู";
  if (category === "employee") return "พนักงานราชการ";
  if (category === "staff") return "เจ้าหน้าที่";
  if (category === "executive") return "ผู้บริหาร";
  return "บุคลากร";
}

function profileInitialValues(profile: PersonnelDirectoryProfile): Record<string, AdminCrudValue> {
  return {
    page_slug: "personnel-data",
    section_title: profile.section_title || categorySectionLabel(personnelCategory(profile)),
    full_name: profile.full_name,
    position_title: profile.position_title,
    department: profile.department,
    committee_role: profile.committee_role,
    contact_phone: profile.contact_phone,
    contact_email: profile.contact_email,
    contact_channel: profile.contact_channel,
    term_period: profile.term_period,
    photo_path: profile.photo_path,
    appointment_file: profile.appointment_file,
    profile_note: profile.profile_note,
    sort_order: profile.sort_order,
    status: "active",
  };
}

function PersonnelPhoto({ profile }: { profile: PersonnelDirectoryProfile }) {
  const photoPath = publicAssetPath(profile.photo_path);

  return (
    <div
      className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 bg-cover bg-center bg-no-repeat text-2xl font-bold text-blue-800 ring-1 ring-blue-100"
      style={photoPath ? { backgroundImage: `url("${photoPath}")` } : undefined}
      aria-label={profile.full_name}
    >
      {photoPath ? null : initialText(profile.full_name)}
    </div>
  );
}

export function PersonnelDirectory({
  profiles,
  summaryStats,
  searchParams,
  user,
  personnelConfig,
  personnelRows,
  summaryConfig,
  summaryRows,
}: PersonnelDirectoryProps) {
  const query = firstValue(searchParams, "q").trim();
  const selectedDepartment = firstValue(searchParams, "department") || "all";
  const selectedCategory = firstValue(searchParams, "type") || "all";
  const selectedPosition = firstValue(searchParams, "position") || "all";
  const personnelRowsById = new Map((personnelRows ?? []).map((row) => [row.id, row]));
  const summaryRowsById = new Map((summaryRows ?? []).map((row) => [row.id, row]));
  const canManagePersonnel = Boolean(user && personnelConfig && canAccess(user.effectivePermissions, personnelConfig.permission));
  const canManageSummary = Boolean(user && summaryConfig && canAccess(user.effectivePermissions, summaryConfig.permission));
  const directoryProfiles = profiles;
  const activeProfiles = directoryProfiles.filter((profile) => isActive(profile.status));
  const inactiveProfiles = canManagePersonnel && profiles.length ? profiles.filter((profile) => !isActive(profile.status)) : [];
  const latestYear = summaryStats[0]?.academic_year ?? "2569";
  const currentSummary = summaryStats.filter((item) => item.academic_year === latestYear && isActive(item.status));
  const summaryTotal = currentSummary.reduce((sum, item) => sum + Number(item.staff_count ?? 0), 0);
  const categoryStats = categoryMeta.slice(1).map((item) => ({
    ...item,
    value: countCategory(activeProfiles, currentSummary, item.key),
  }));
  const directoryTotal = summaryTotal || activeProfiles.length;
  const departments = Array.from(new Set(activeProfiles.map((profile) => profile.department).filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b, "th")
  );
  const positions = Array.from(new Set(activeProfiles.map((profile) => profile.position_title).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "th")
  );
  const filteredProfiles = activeProfiles.filter((profile) => {
    const category = personnelCategory(profile);
    const haystack = normalize([profile.full_name, profile.position_title, profile.department, profile.contact_email].filter(Boolean).join(" "));
    const matchesQuery = !query || haystack.includes(normalize(query));
    const matchesDepartment = selectedDepartment === "all" || profile.department === selectedDepartment;
    const matchesCategory = selectedCategory === "all" || category === selectedCategory;
    const matchesPosition = selectedPosition === "all" || profile.position_title === selectedPosition;

    return matchesQuery && matchesDepartment && matchesCategory && matchesPosition;
  });
  const departmentStats = departments
    .map((department) => ({
      department,
      count: activeProfiles.filter((profile) => profile.department === department).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);
  const maxDepartmentCount = Math.max(1, ...departmentStats.map((item) => item.count));
  const cumulative = categoryStats.reduce<number[]>((points, item, index) => {
    const previous = points[index - 1] ?? 0;
    points.push(previous + percent(item.value, Math.max(1, categoryStats.reduce((sum, stat) => sum + stat.value, 0))));
    return points;
  }, []);
  const chartTotal = categoryStats.reduce((sum, item) => sum + item.value, 0);
  const chartStyle =
    chartTotal > 0
      ? {
          background: `conic-gradient(#7c3aed 0 ${cumulative[0]}%, #16a34a ${cumulative[0]}% ${cumulative[1]}%, #f97316 ${cumulative[1]}% ${cumulative[2]}%, #0891b2 ${cumulative[2]}% 100%)`,
        }
      : { background: "#e2e8f0" };
  const selectedSectionLabel = categorySectionLabel(selectedCategory);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-950/5">
        <div className="relative bg-[linear-gradient(135deg,#f8fbff,#eaf4ff)] px-5 py-8 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#93c5fd,transparent)]" />
          <Badge variant="outline" className="bg-white/80 text-blue-700">
            Personnel Directory & Information System
          </Badge>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-blue-950 md:text-5xl">ระบบบุคลากร</h1>
          <p className="mt-2 text-2xl font-bold text-blue-700">ข้อมูลบุคลากรและตำแหน่ง</p>
          <p className="mt-2 text-sm text-slate-500">ปีการศึกษา {latestYear} · แสดงรายชื่อ ค้นหา และจัดการข้อมูลบุคลากรจากฐานข้อมูลกลาง</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { ...categoryMeta[0], value: directoryTotal, note: currentSummary[0]?.context_note ?? "รวมจากข้อมูลบุคลากรและสรุปประจำปี" },
          ...categoryStats.map((item) => ({
            ...item,
            note: `${percent(item.value, Math.max(1, directoryTotal))}% ของทั้งหมด`,
          })),
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.key} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
              <div className="flex items-center gap-3">
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${item.className}`}>
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                  <strong className="block text-3xl leading-tight text-slate-950">{item.value.toLocaleString("th-TH")}</strong>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">{item.note}</p>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
        <form action="/content/personnel-data" className="grid min-w-0 gap-3 lg:grid-cols-3 xl:grid-cols-[minmax(220px,1.2fr)_minmax(150px,.9fr)_minmax(150px,.9fr)_minmax(150px,.9fr)_86px_78px]">
          <label className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 text-sm text-slate-500">
            <Search className="size-4 text-blue-600" />
            <input name="q" defaultValue={query} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="พิมพ์ชื่อ, ตำแหน่ง หรืออีเมล" />
          </label>
          <select name="department" defaultValue={selectedDepartment} className="h-11 w-full min-w-0 rounded-lg border border-blue-100 bg-white px-3 text-sm text-slate-700 outline-none">
            <option value="all">ฝ่าย / แผนกทั้งหมด</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          <select name="type" defaultValue={selectedCategory} className="h-11 w-full min-w-0 rounded-lg border border-blue-100 bg-white px-3 text-sm text-slate-700 outline-none">
            <option value="all">ประเภทบุคลากรทั้งหมด</option>
            {categoryMeta.slice(1).map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <select name="position" defaultValue={selectedPosition} className="h-11 w-full min-w-0 rounded-lg border border-blue-100 bg-white px-3 text-sm text-slate-700 outline-none">
            <option value="all">ตำแหน่งทั้งหมด</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position.length > 54 ? `${position.slice(0, 54)}...` : position}
              </option>
            ))}
          </select>
          <Button type="submit" className="h-11 w-full">
            <Search data-icon="inline-start" />
            ค้นหา
          </Button>
          <Button asChild type="button" variant="outline" className="h-11 w-full">
            <Link href="/content/personnel-data">
              <RotateCcw data-icon="inline-start" />
              รีเซ็ต
            </Link>
          </Button>
        </form>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categoryMeta.map((item) => (
            <Button asChild key={item.key} size="sm" variant={selectedCategory === item.key || (selectedCategory === "all" && item.key === "all") ? "default" : "outline"}>
              <Link href={buildPath({ q: query, department: selectedDepartment, type: item.key, position: selectedPosition })}>{item.label}</Link>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {personnelConfig ? (
            <AdminCrudCreateButton
              user={user}
              permission={personnelConfig.permission}
              moduleKey={personnelConfig.key}
              moduleLabel={personnelConfig.label}
              fields={personnelConfig.fields}
              label={`เพิ่ม${selectedSectionLabel}`}
              adminHref="/admin/modules/personnel_profiles"
              initialValues={{ page_slug: "personnel-data", section_title: selectedSectionLabel, status: "active" }}
            />
          ) : null}
          {summaryConfig ? (
            <AdminCrudCreateButton
              user={user}
              permission={summaryConfig.permission}
              moduleKey={summaryConfig.key}
              moduleLabel={summaryConfig.label}
              fields={summaryConfig.fields}
              label="เพิ่มสรุปจำนวน"
              adminHref="/admin/modules/personnel_summary_stats"
              initialValues={{ academic_year: latestYear, status: "active" }}
            />
          ) : null}
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-white px-4 py-3 shadow-sm shadow-blue-950/5">
            <div>
              <h2 className="text-xl font-bold tracking-normal text-slate-950">รายชื่อบุคลากร</h2>
              <p className="text-sm text-slate-500">พบ {filteredProfiles.length.toLocaleString("th-TH")} รายการ จากข้อมูลที่เปิดใช้งาน</p>
            </div>
            <Badge variant="secondary">{activeProfiles.length.toLocaleString("th-TH")} โปรไฟล์</Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {filteredProfiles.map((profile) => {
              const category = categoryMeta.find((item) => item.key === personnelCategory(profile)) ?? categoryMeta[4];
              const crudRow = personnelRowsById.get(profile.id);

              return (
                <article key={profile.id} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
                  <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-4">
                    <PersonnelPhoto profile={profile} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`border-0 ${category.chip}`}>{category.label}</Badge>
                        {profile.committee_role ? (
                          <Badge variant="outline" className="max-w-full whitespace-normal text-left leading-5">
                            {profile.committee_role}
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-2 line-clamp-1 text-lg font-bold text-slate-950">{profile.full_name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{profile.position_title}</p>
                      {profile.department ? (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-700">
                          <Building2 className="size-3.5" />
                          <span className="line-clamp-1">{profile.department}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {profile.profile_note ? <p className="mt-3 line-clamp-2 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">{profile.profile_note}</p> : null}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-2">
                      {profile.contact_phone ? (
                        <Button asChild size="icon-sm" variant="outline" title={profile.contact_phone}>
                          <a href={`tel:${profile.contact_phone}`}>
                            <Phone className="size-4" />
                          </a>
                        </Button>
                      ) : null}
                      {profile.contact_email ? (
                        <Button asChild size="icon-sm" variant="outline" title={profile.contact_email}>
                          <a href={`mailto:${profile.contact_email}`}>
                            <Mail className="size-4" />
                          </a>
                        </Button>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/content/${profile.page_slug}`}>ดูข้อมูล</Link>
                      </Button>
                      {personnelConfig && (crudRow || canManagePersonnel) ? (
                        <AdminCrudTools
                          user={user}
                          permission={personnelConfig.permission}
                          moduleKey={personnelConfig.key}
                          moduleLabel={personnelConfig.label}
                          fields={personnelConfig.fields}
                          row={crudRow}
                          label="จัดการ"
                          triggerSize="sm"
                          adminHref="/admin/modules/personnel_profiles"
                          afterCreateHref="/content/personnel-data"
                          afterDeleteHref="/admin/modules/personnel_profiles"
                          initialValues={crudRow ? undefined : profileInitialValues(profile)}
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {!filteredProfiles.length ? (
            <div className="rounded-lg border border-dashed border-blue-200 bg-white p-8 text-center text-sm text-slate-500">
              ยังไม่มีรายชื่อที่ตรงกับตัวกรองนี้
            </div>
          ) : null}

          {inactiveProfiles.length ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <Badge variant="outline" className="border-amber-200 bg-white text-amber-800">เฉพาะผู้ดูแล</Badge>
                  <h3 className="mt-2 font-bold text-slate-950">บุคลากรที่ปิดใช้งานอยู่</h3>
                  <p className="text-sm text-slate-600">รายการถูกซ่อนจากหน้าเว็บ แต่ยังเรียกกลับมาแก้ไขและเปิดใช้งานได้</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/modules/personnel_profiles">เปิดหน้าจัดการทั้งหมด</Link>
                </Button>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {inactiveProfiles.map((profile) => {
                  const crudRow = personnelRowsById.get(profile.id);

                  return (
                    <div key={profile.id} className="flex items-center justify-between gap-3 rounded-md border border-amber-100 bg-white p-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">{profile.full_name}</p>
                        <p className="truncate text-xs text-slate-500">{profile.position_title}</p>
                      </div>
                      {personnelConfig && crudRow ? (
                        <AdminCrudTools
                          user={user}
                          permission={personnelConfig.permission}
                          moduleKey={personnelConfig.key}
                          moduleLabel={personnelConfig.label}
                          fields={personnelConfig.fields}
                          row={crudRow}
                          label="จัดการ"
                          triggerSize="sm"
                          adminHref="/admin/modules/personnel_profiles"
                          afterDeleteHref="/admin/modules/personnel_profiles"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
            <h3 className="font-bold text-slate-950">สัดส่วนบุคลากร</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative size-32 shrink-0 rounded-full" style={chartStyle}>
                <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white text-center">
                  <strong className="text-2xl text-slate-950">{directoryTotal.toLocaleString("th-TH")}</strong>
                  <span className="text-xs text-slate-500">คน</span>
                </div>
              </div>
              <div className="grid gap-2 text-xs">
                {categoryStats.map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${item.key === "executive" ? "bg-violet-600" : item.key === "teacher" ? "bg-emerald-600" : item.key === "employee" ? "bg-orange-500" : "bg-cyan-600"}`} />
                    <span className="text-slate-600">{item.label}</span>
                    <strong className="text-slate-900">{item.value.toLocaleString("th-TH")}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
            <h3 className="font-bold text-slate-950">จำนวนตามฝ่าย / แผนก</h3>
            <div className="mt-4 grid gap-3">
              {departmentStats.map((item) => (
                <div key={item.department} className="grid grid-cols-[96px_1fr_34px] items-center gap-2 text-xs">
                  <span className="line-clamp-1 font-medium text-slate-700">{item.department}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full rounded-full bg-blue-600" style={{ width: `${Math.max(8, Math.round((item.count / maxDepartmentCount) * 100))}%` }} />
                  </span>
                  <span className="text-right text-slate-600">{item.count.toLocaleString("th-TH")}</span>
                </div>
              ))}
              {!departmentStats.length ? <p className="text-sm text-slate-500">ยังไม่มีข้อมูลฝ่าย/แผนกจากรายชื่อบุคลากร</p> : null}
            </div>
          </section>

          {canManageSummary && currentSummary.length ? (
            <section className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
              <h3 className="font-bold text-slate-950">จัดการสรุปจำนวน</h3>
              <div className="mt-3 grid gap-2">
                {currentSummary.slice(0, 5).map((item) => {
                  const row = summaryRowsById.get(item.id);

                  return (
                    <div key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-blue-100 p-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{item.personnel_type}</p>
                        <p className="text-xs text-slate-500">{Number(item.staff_count).toLocaleString("th-TH")} คน</p>
                      </div>
                      {summaryConfig && row ? (
                        <AdminCrudTools
                          user={user}
                          permission={summaryConfig.permission}
                          moduleKey={summaryConfig.key}
                          moduleLabel={summaryConfig.label}
                          fields={summaryConfig.fields}
                          row={row}
                          label="แก้"
                          triggerSize="sm"
                          adminHref="/admin/modules/personnel_summary_stats"
                          afterDeleteHref="/admin/modules/personnel_summary_stats"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
