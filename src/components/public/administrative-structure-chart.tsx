import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Landmark,
  Network,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { Badge } from "@/components/ui/badge";
import type { AdminUser } from "@/lib/admin-auth";
import type { AdminCrudModuleConfig, AdminCrudRow, AdminCrudValue } from "@/lib/admin-crud-config";
import { canAccess } from "@/lib/permissions";

export type AdministrativeStructureUnit = {
  id: number;
  academic_year: string;
  unit_key: string;
  unit_type: string;
  title: string;
  leader_name: string | null;
  leader_position: string | null;
  description: string | null;
  duties_title: string | null;
  duties_text: string | null;
  secondary_title: string | null;
  secondary_duties_text: string | null;
  color_theme: string;
  icon_name: string | null;
  sort_order: number;
  status: string;
};

type AdministrativeStructureChartProps = {
  units: AdministrativeStructureUnit[];
  user?: AdminUser | null;
  config?: AdminCrudModuleConfig | null;
  crudRows?: AdminCrudRow[] | null;
  pageSummary?: string;
};

type Theme = {
  border: string;
  soft: string;
  header: string;
  text: string;
  bullet: string;
  line: string;
  ring: string;
};

const themes: Record<string, Theme> = {
  blue: {
    border: "border-blue-200",
    soft: "bg-blue-50",
    header: "from-blue-700 to-sky-500",
    text: "text-blue-800",
    bullet: "bg-blue-600",
    line: "border-blue-300",
    ring: "ring-blue-100",
  },
  teal: {
    border: "border-teal-200",
    soft: "bg-teal-50",
    header: "from-teal-600 to-emerald-500",
    text: "text-teal-800",
    bullet: "bg-teal-600",
    line: "border-teal-300",
    ring: "ring-teal-100",
  },
  violet: {
    border: "border-violet-200",
    soft: "bg-violet-50",
    header: "from-violet-700 to-purple-500",
    text: "text-violet-800",
    bullet: "bg-violet-600",
    line: "border-violet-300",
    ring: "ring-violet-100",
  },
  orange: {
    border: "border-orange-200",
    soft: "bg-orange-50",
    header: "from-orange-600 to-amber-400",
    text: "text-orange-800",
    bullet: "bg-orange-500",
    line: "border-orange-300",
    ring: "ring-orange-100",
  },
  purple: {
    border: "border-purple-200",
    soft: "bg-purple-50",
    header: "from-purple-700 to-fuchsia-500",
    text: "text-purple-800",
    bullet: "bg-purple-600",
    line: "border-purple-300",
    ring: "ring-purple-100",
  },
};

const iconMap = {
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  building: Building2,
  clipboard: ClipboardCheck,
  landmark: Landmark,
  network: Network,
  target: Target,
  user: UserRound,
  users: UsersRound,
};

const fallbackUnits: AdministrativeStructureUnit[] = [
  {
    id: -1,
    academic_year: "2569",
    unit_key: "director",
    unit_type: "director",
    title: "ผู้อำนวยการวิทยาลัย",
    leader_name: "นายอภิชาติ กุลรานี",
    leader_position: "ผู้อำนวยการวิทยาลัยสารพัดช่างสุรินทร์",
    description: "กำกับดูแลการบริหารสถานศึกษาและการจัดการอาชีวศึกษา",
    duties_title: null,
    duties_text: null,
    secondary_title: null,
    secondary_duties_text: null,
    color_theme: "blue",
    icon_name: "user",
    sort_order: 0,
    status: "active",
  },
  {
    id: -2,
    academic_year: "2569",
    unit_key: "college-board",
    unit_type: "committee",
    title: "คณะกรรมการวิทยาลัย",
    leader_name: null,
    leader_position: "กำกับ ติดตาม และให้ข้อเสนอแนะการบริหารสถานศึกษา",
    description: null,
    duties_title: null,
    duties_text: null,
    secondary_title: null,
    secondary_duties_text: null,
    color_theme: "purple",
    icon_name: "users",
    sort_order: 5,
    status: "active",
  },
  {
    id: -3,
    academic_year: "2569",
    unit_key: "resource",
    unit_type: "division",
    title: "ฝ่ายบริหารทรัพยากร",
    leader_name: "นายเทอดศักดิ์ ผลพูน",
    leader_position: null,
    description: "ดูแลงานสนับสนุน ทรัพยากร และระบบบริการภายในวิทยาลัย",
    duties_title: "งานในกำกับ",
    duties_text: "งานบริหารงานทั่วไป\nงานบริหารและพัฒนาทรัพยากรบุคคล\nงานการเงิน\nงานการบัญชี\nงานพัสดุ\nงานอาคารสถานที่\nงานทะเบียน",
    secondary_title: null,
    secondary_duties_text: null,
    color_theme: "blue",
    icon_name: "building",
    sort_order: 10,
    status: "active",
  },
  {
    id: -4,
    academic_year: "2569",
    unit_key: "planning",
    unit_type: "division",
    title: "ฝ่ายยุทธศาสตร์และแผนงาน",
    leader_name: "กำกับดูแลร่วม",
    leader_position: null,
    description: "ขับเคลื่อนแผน งานคุณภาพ งานความร่วมมือ วิจัย และนวัตกรรม",
    duties_title: "งานในกำกับ",
    duties_text: "งานพัฒนายุทธศาสตร์ แผนงานและงบประมาณ\nงานมาตรฐานและการประกันคุณภาพการศึกษา\nงานศูนย์ดิจิทัลและสื่อสารองค์กร\nงานส่งเสริมการวิจัย นวัตกรรมและสิ่งประดิษฐ์\nงานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ\nงานติดตามและประเมินผลการอาชีวศึกษา",
    secondary_title: null,
    secondary_duties_text: null,
    color_theme: "teal",
    icon_name: "target",
    sort_order: 20,
    status: "active",
  },
  {
    id: -5,
    academic_year: "2569",
    unit_key: "student-affairs",
    unit_type: "division",
    title: "ฝ่ายกิจการนักเรียน นักศึกษา",
    leader_name: "นางสุนีย์ ปรีชานนทกุล",
    leader_position: null,
    description: "ดูแลกิจกรรมนักเรียน นักศึกษา งานแนะแนว สวัสดิการ และบริการชุมชน",
    duties_title: "งานในกำกับ",
    duties_text: "งานกิจกรรมนักเรียน นักศึกษา\nงานครูที่ปรึกษาและการแนะแนว\nงานปกครองและความปลอดภัยนักเรียน นักศึกษา\nงานสวัสดิการนักเรียน นักศึกษา\nงานโครงการพิเศษและบริการชุมชน",
    secondary_title: null,
    secondary_duties_text: null,
    color_theme: "violet",
    icon_name: "users",
    sort_order: 30,
    status: "active",
  },
  {
    id: -6,
    academic_year: "2569",
    unit_key: "academic",
    unit_type: "division",
    title: "ฝ่ายวิชาการ",
    leader_name: "นางปาลิดา ศรีตุลานุกค์",
    leader_position: null,
    description: "บริหารหลักสูตร การจัดการเรียนรู้ วัดผล และแผนกวิชา",
    duties_title: "A) งานสนับสนุนฝ่ายวิชาการ",
    duties_text: "งานพัฒนาหลักสูตรและการจัดการเรียนรู้\nงานวัดผลประเมินผล\nงานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ\nงานวิทยบริการและเทคโนโลยีการศึกษา\nงานการศึกษาพิเศษและความเสมอภาคทางการศึกษา",
    secondary_title: "B) แผนกวิชา / สาขาวิชา",
    secondary_duties_text: "แผนกวิชาสามัญสัมพันธ์\nแผนกวิชาเทคนิคพื้นฐาน\nสาขาวิชาช่างยนต์\nสาขาวิชาช่างกลโรงงาน\nสาขาวิชาช่างไฟฟ้ากำลัง\nสาขาวิชาช่างอิเล็กทรอนิกส์\nสาขาวิชาการบัญชี\nสาขาวิชาคอมพิวเตอร์\nสาขาวิชาอาหารและโภชนาการ\nสาขาวิชาเทคนิคเครื่องกล\nสาขาวิชาการจัดการงานบริการสถานพยาบาล\nสาขาวิชาการท่องเที่ยว",
    color_theme: "orange",
    icon_name: "book",
    sort_order: 40,
    status: "active",
  },
];

function splitItems(value?: string | null): string[] {
  return (value ?? "")
    .split(/\r?\n|;/)
    .map((item) => item.trim().replace(/^[-•]\s*/, ""))
    .filter(Boolean);
}

function activeUnits(units: AdministrativeStructureUnit[]): AdministrativeStructureUnit[] {
  const source = units.length ? units : fallbackUnits;
  const active = source.filter((unit) => unit.status === "active" || unit.status === "published" || unit.status === "1");
  return active.length ? active : fallbackUnits;
}

function unitTheme(unit: AdministrativeStructureUnit): Theme {
  return themes[unit.color_theme] ?? themes.blue;
}

function UnitIcon({ unit, className = "size-6" }: { unit: AdministrativeStructureUnit; className?: string }) {
  const Icon = iconMap[(unit.icon_name ?? "building") as keyof typeof iconMap] ?? Building2;

  return <Icon className={className} />;
}

function UnitTools({
  unit,
  config,
  crudRowsById,
  user,
  label = "จัดการ",
}: {
  unit: AdministrativeStructureUnit;
  config?: AdminCrudModuleConfig | null;
  crudRowsById: Map<number, AdminCrudRow>;
  user?: AdminUser | null;
  label?: string;
}) {
  if (!config || !user || !canAccess(user.effectivePermissions, config.permission)) {
    return null;
  }

  const row = unit.id > 0 ? crudRowsById.get(unit.id) : null;

  if (!row) {
    const initialValues: Record<string, AdminCrudValue> = {
      academic_year: unit.academic_year,
      unit_key: unit.unit_key,
      unit_type: unit.unit_type,
      title: unit.title,
      leader_name: unit.leader_name,
      leader_position: unit.leader_position,
      description: unit.description,
      duties_title: unit.duties_title,
      duties_text: unit.duties_text,
      secondary_title: unit.secondary_title,
      secondary_duties_text: unit.secondary_duties_text,
      color_theme: unit.color_theme,
      icon_name: unit.icon_name,
      sort_order: unit.sort_order,
      status: unit.status === "published" ? "active" : unit.status,
    };

    return (
      <AdminCrudTools
        user={user}
        permission={config.permission}
        moduleKey={config.key}
        moduleLabel={config.label}
        fields={config.fields}
        label={label}
        triggerSize="sm"
        adminHref="/admin/modules/administrative_structure"
        afterCreateHref="/content/administrative-structure"
        initialValues={initialValues}
      />
    );
  }

  return (
    <AdminCrudTools
      user={user}
      permission={config.permission}
      moduleKey={config.key}
      moduleLabel={config.label}
      fields={config.fields}
      row={row}
      label={label}
      triggerSize="sm"
      adminHref="/admin/modules/administrative_structure"
      afterDeleteHref="/admin/modules/administrative_structure"
    />
  );
}

type DutyItem = {
  title: string;
  people: string[];
};

function parseDutyItem(value: string): DutyItem {
  const [rawTitle, rawPeople = ""] = value
    .split(/\s*(?:\||::|->)\s*|\s-\sผู้รับผิดชอบ\s*:?\s*/i)
    .map((part) => part.trim());
  const people = rawPeople
    .split(/[,;、\n]/)
    .map((person) => person.trim())
    .filter(Boolean);

  return { title: rawTitle || value, people };
}

function DutyList({ items, theme, compact = false }: { items: string[]; theme: Theme; compact?: boolean }) {
  if (!items.length) {
    return null;
  }

  return (
    <ul className={`relative grid gap-2 pl-5 before:absolute before:bottom-4 before:left-2 before:top-4 before:border-l-2 before:border-dashed ${theme.line}`}>
      {items.map((item) => {
        const duty = parseDutyItem(item);

        return (
        <li
          key={item}
          className={`relative rounded-md border border-slate-100 bg-white/95 px-3 shadow-sm shadow-blue-950/5 ${
            compact ? "py-1.5 text-xs leading-5" : "py-2 text-sm leading-6"
          } text-slate-700`}
        >
          <span className={`absolute -left-[19px] top-1/2 size-2.5 -translate-y-1/2 rounded-full ring-4 ring-white ${theme.bullet}`} />
          {duty.people.length ? (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-slate-800">
                <span>{duty.title}</span>
                <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2 rounded-md bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-bold text-slate-500">ผู้รับผิดชอบ</p>
                <ul className="mt-1 grid gap-1">
                  {duty.people.map((person) => (
                    <li key={person} className="text-xs leading-5 text-slate-600">{person}</li>
                  ))}
                </ul>
              </div>
            </details>
          ) : (
            <span>{duty.title}</span>
          )}
        </li>
        );
      })}
    </ul>
  );
}

function DivisionCard({
  unit,
  config,
  crudRowsById,
  user,
  wide = false,
}: {
  unit: AdministrativeStructureUnit;
  config?: AdminCrudModuleConfig | null;
  crudRowsById: Map<number, AdminCrudRow>;
  user?: AdminUser | null;
  wide?: boolean;
}) {
  const theme = unitTheme(unit);
  const duties = splitItems(unit.duties_text);
  const secondaryDuties = splitItems(unit.secondary_duties_text);

  return (
    <article className={`overflow-hidden rounded-lg border bg-white shadow-lg shadow-blue-950/5 ${theme.border} ${wide ? "lg:col-span-2" : ""}`}>
      <div className={`bg-gradient-to-r ${theme.header} px-4 py-3 text-white`}>
        <div className={`flex items-center gap-3 ${wide ? "justify-center text-center md:justify-start md:text-left" : ""}`}>
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-sm ring-1 ring-white/70">
            <UnitIcon unit={unit} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className={`${wide ? "text-xl" : "text-lg"} font-extrabold leading-7`}>{unit.title}</h3>
            {unit.leader_name ? <p className="mt-0.5 text-sm font-semibold text-white/95">{unit.leader_name}</p> : null}
            {unit.leader_position ? <p className="mt-0.5 text-xs leading-5 text-white/80">{unit.leader_position}</p> : null}
          </div>
          <UnitTools unit={unit} config={config} crudRowsById={crudRowsById} user={user} />
        </div>
      </div>
      <div className={`grid gap-4 p-4 ${theme.soft}`}>
        {unit.description ? <p className="text-sm leading-6 text-slate-700">{unit.description}</p> : null}
        <div className={`grid gap-4 ${wide && secondaryDuties.length ? "md:grid-cols-2" : ""}`}>
          <section className="rounded-lg border border-white/80 bg-white/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              {unit.duties_title ? <h4 className={`text-sm font-bold ${theme.text}`}>{unit.duties_title}</h4> : <span />}
              <UnitTools unit={unit} config={config} crudRowsById={crudRowsById} user={user} label="แก้งาน" />
            </div>
            <DutyList items={duties} theme={theme} compact={wide} />
          </section>
          {unit.secondary_title || secondaryDuties.length ? (
            <section className="rounded-lg border border-white/80 bg-white/60 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                {unit.secondary_title ? <h4 className={`text-sm font-bold ${theme.text}`}>{unit.secondary_title}</h4> : <span />}
                <UnitTools unit={unit} config={config} crudRowsById={crudRowsById} user={user} label="แก้งานรอง" />
              </div>
              <DutyList items={secondaryDuties} theme={theme} compact={wide} />
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function AdministrativeStructureChart({
  units,
  user,
  config,
  crudRows,
  pageSummary,
}: AdministrativeStructureChartProps) {
  const displayUnits = activeUnits(units);
  const year = displayUnits[0]?.academic_year ?? "2569";
  const director = displayUnits.find((unit) => unit.unit_type === "director") ?? fallbackUnits[0];
  const committee = displayUnits.find((unit) => unit.unit_type === "committee");
  const divisions = displayUnits.filter((unit) => unit.unit_type === "division").sort((a, b) => a.sort_order - b.sort_order);
  const inactiveUnits = units.filter((unit) => unit.status !== "active" && unit.status !== "published" && unit.status !== "1");
  const crudRowsById = new Map((crudRows ?? []).map((row) => [row.id, row]));
  const canManageStructure = Boolean(user && config && canAccess(user.effectivePermissions, config.permission));
  const branchStops = divisions.map((unit, index) => {
    if (unit.secondary_title || splitItems(unit.secondary_duties_text).length) {
      return 80;
    }

    return [10, 30, 50, 70][index] ?? Math.min(90, 10 + index * 20);
  });
  const branchStart = branchStops.length ? Math.min(...branchStops) : 10;
  const branchEnd = branchStops.length ? Math.max(...branchStops) : 90;
  const addInitialValues: Record<string, AdminCrudValue> = {
    academic_year: year,
    unit_type: "division",
    color_theme: "blue",
    icon_name: "building",
    status: "active",
  };

  return (
    <section className="overflow-hidden border-y border-blue-100 bg-[linear-gradient(135deg,#f7fcff_0%,#ffffff_48%,#eef7ff_100%)] shadow-sm shadow-blue-950/5">
      <div className="relative mx-auto max-w-[1580px] px-4 py-8 md:px-8">
        <div className="relative z-10 flex flex-col gap-4 text-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-normal text-blue-950 md:text-5xl">
              โครงสร้างการบริหารวิทยาลัยสารพัดช่างสุรินทร์
            </h2>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
              <span className="hidden h-px w-28 bg-cyan-300 md:block" />
              <Badge variant="outline" className="border-cyan-200 bg-white/90 px-4 py-1 text-base font-bold text-cyan-700">
                ประจำปีการศึกษา {year}
              </Badge>
              <UnitTools unit={director} config={config} crudRowsById={crudRowsById} user={user} label="แก้ปี" />
              <span className="hidden h-px w-28 bg-cyan-300 md:block" />
            </div>
            {pageSummary ? <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-600">{pageSummary}</p> : null}
          </div>
          {canManageStructure && config ? (
            <div className="flex justify-center lg:absolute lg:right-0 lg:top-0">
              <AdminCrudCreateButton
                user={user}
                permission={config.permission}
                moduleKey={config.key}
                moduleLabel={config.label}
                fields={config.fields}
                label="เพิ่มหน่วยงานในโครงสร้าง"
                adminHref="/admin/modules/administrative_structure"
                afterCreateHref="/content/administrative-structure"
                initialValues={addInitialValues}
              />
            </div>
          ) : null}
        </div>

        <div className="relative z-10 mx-auto mt-8 max-w-[1480px]">
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(430px,520px)_minmax(280px,340px)_minmax(0,1fr)] lg:items-center">
            <div className="hidden lg:block" />
            <article className="relative mx-auto w-full max-w-xl rounded-lg border border-blue-300 bg-gradient-to-r from-blue-800 to-blue-600 p-5 text-white shadow-xl shadow-blue-950/15">
              <span className="absolute left-1/2 top-full hidden h-10 border-l-2 border-blue-500 lg:block" />
              <div className="grid gap-4 sm:grid-cols-[72px_1fr_auto] sm:items-center">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/50 bg-white/15">
                  <UnitIcon unit={director} className="size-8" />
                </span>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-extrabold leading-8">{director.title}</h3>
                  {director.leader_name ? <p className="mt-1 text-lg font-semibold text-white/95">{director.leader_name}</p> : null}
                  {director.leader_position ? <p className="mt-1 text-sm leading-6 text-blue-100">{director.leader_position}</p> : null}
                </div>
                <UnitTools unit={director} config={config} crudRowsById={crudRowsById} user={user} label="แก้กล่อง" />
              </div>
            </article>

            {committee ? (
              <article className="relative rounded-lg border border-purple-300 bg-white p-4 shadow-lg shadow-purple-950/5">
                <span className="absolute right-full top-1/2 hidden w-14 -translate-y-1/2 border-t-2 border-dashed border-slate-400 lg:block" />
                <ArrowRight className="absolute -left-3 top-1/2 hidden size-5 -translate-y-1/2 text-slate-500 lg:block" />
                <div className="flex items-center gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                    <UnitIcon unit={committee} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-950">{committee.title}</h3>
                    {committee.leader_position ? <p className="mt-1 text-xs leading-5 text-slate-500">{committee.leader_position}</p> : null}
                  </div>
                  <UnitTools unit={committee} config={config} crudRowsById={crudRowsById} user={user} label="แก้กล่อง" />
                </div>
              </article>
            ) : (
              <div className="hidden lg:block" />
            )}
            <div className="hidden lg:block" />
          </div>

          {divisions.length ? (
            <div className="relative mx-auto mt-10 hidden h-12 max-w-6xl lg:block">
              <span
                className="absolute top-0 border-t-2 border-blue-500"
                style={{ left: `${branchStart}%`, right: `${100 - branchEnd}%` }}
              />
              {branchStops.map((stop, index) => (
                <span key={`${stop}-${index}`} className="absolute top-0 h-9 border-l-2 border-blue-500" style={{ left: `${stop}%` }}>
                  <span className="absolute -bottom-[1px] -left-[5px] size-2.5 rotate-45 border-b-2 border-r-2 border-blue-500" />
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-1 grid gap-5 lg:grid-cols-5">
            {divisions.map((unit) => {
              const wide = Boolean(unit.secondary_title || splitItems(unit.secondary_duties_text).length);

              return (
                <DivisionCard
                  key={unit.unit_key}
                  unit={unit}
                  config={config}
                  crudRowsById={crudRowsById}
                  user={user}
                  wide={wide}
                />
              );
            })}
          </div>
        </div>

        {inactiveUnits.length > 0 && canManageStructure && config ? (
          <section className="relative mt-6 rounded-lg border border-amber-200 bg-amber-50/85 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge variant="outline" className="border-amber-200 bg-white text-amber-800">
                  เฉพาะผู้ดูแล
                </Badge>
                <h3 className="mt-2 text-lg font-bold tracking-normal text-slate-950">รายการโครงสร้างที่ปิดใช้งาน</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  รายการเหล่านี้ถูกซ่อนจากผู้เข้าชม แต่ยังสามารถแก้ไขหรือเปิดใช้งานกลับมาได้
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {inactiveUnits.map((unit) => {
                const row = crudRowsById.get(unit.id);

                return (
                  <div key={unit.id} className="flex flex-col gap-3 rounded-md border border-amber-100 bg-white p-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{unit.title}</p>
                      <p className="text-xs text-slate-500">
                        {unit.unit_type} · {unit.academic_year} · {unit.status}
                      </p>
                    </div>
                    {row ? (
                      <AdminCrudTools
                        user={user}
                        permission={config.permission}
                        moduleKey={config.key}
                        moduleLabel={config.label}
                        fields={config.fields}
                        row={row}
                        label="จัดการ"
                        triggerSize="sm"
                        adminHref="/admin/modules/administrative_structure"
                        afterDeleteHref="/admin/modules/administrative_structure"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
