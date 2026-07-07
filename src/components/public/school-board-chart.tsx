import { Award, BriefcaseBusiness, FileText, Mail, Phone, ShieldCheck, UsersRound } from "lucide-react";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/lib/admin-auth";
import type { AdminCrudModuleConfig, AdminCrudRow, AdminCrudValue } from "@/lib/admin-crud-config";
import { publicAssetPath } from "@/lib/legacy-paths";
import { canAccess } from "@/lib/permissions";

export type SchoolBoardProfile = {
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

type SchoolBoardChartProps = {
  title: string;
  summary?: string;
  profiles: SchoolBoardProfile[];
  user?: AdminUser | null;
  config?: AdminCrudModuleConfig | null;
  crudRows?: AdminCrudRow[] | null;
};

function isActive(status?: string | null): boolean {
  return status === "active" || status === "published" || status === "1";
}

function isChair(profile: SchoolBoardProfile): boolean {
  const text = `${profile.committee_role ?? ""} ${profile.position_title ?? ""}`;
  return text.includes("ประธาน") && !text.includes("รองประธาน");
}

function initialText(name: string): string {
  return name.replace(/^[-\s]+/, "").trim().charAt(0) || "ส";
}

function columnsFor(profiles: SchoolBoardProfile[], count = 4): SchoolBoardProfile[][] {
  const columns = Array.from({ length: count }, () => [] as SchoolBoardProfile[]);

  profiles.forEach((profile, index) => {
    columns[index % count].push(profile);
  });

  return columns;
}

function contactItems(profile: SchoolBoardProfile) {
  return [
    profile.contact_phone ? { key: "phone", icon: Phone, label: profile.contact_phone, href: `tel:${profile.contact_phone}` } : null,
    profile.contact_email ? { key: "email", icon: Mail, label: profile.contact_email, href: `mailto:${profile.contact_email}` } : null,
  ].filter(Boolean) as { key: string; icon: typeof Phone; label: string; href: string }[];
}

function BoardTools({
  row,
  user,
  config,
  label = "จัดการ",
}: {
  row?: AdminCrudRow;
  user?: AdminUser | null;
  config?: AdminCrudModuleConfig | null;
  label?: string;
}) {
  if (!config || !row || !user || !canAccess(user.effectivePermissions, config.permission)) {
    return null;
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
      adminHref="/admin/modules/personnel_profiles"
      afterDeleteHref="/admin/modules/personnel_profiles"
    />
  );
}

function BoardCard({
  profile,
  row,
  user,
  config,
  featured = false,
}: {
  profile: SchoolBoardProfile;
  row?: AdminCrudRow;
  user?: AdminUser | null;
  config?: AdminCrudModuleConfig | null;
  featured?: boolean;
}) {
  const photoPath = publicAssetPath(profile.photo_path);
  const appointmentPath = publicAssetPath(profile.appointment_file);
  const contacts = contactItems(profile);

  return (
    <article
      className={`relative z-10 overflow-hidden rounded-lg border border-blue-100 bg-white shadow-lg shadow-blue-950/8 ${
        featured ? "mx-auto grid w-full max-w-xl gap-5 p-5 md:grid-cols-[150px_1fr] md:items-center" : "p-3"
      }`}
    >
      <div
        className={`mx-auto flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-amber-200 bg-amber-50 text-blue-900 shadow-sm ${
          featured ? "h-48 w-36" : "h-36 w-28"
        }`}
      >
        {photoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPath} alt={profile.full_name} className="h-full w-full object-cover" />
        ) : (
          <span className={featured ? "text-5xl font-extrabold" : "text-3xl font-extrabold"}>{initialText(profile.full_name)}</span>
        )}
      </div>
      <div className={featured ? "min-w-0 text-center md:text-left" : "mt-3 text-center"}>
        {profile.committee_role ? (
          <Badge className={`mb-2 bg-blue-700 text-white ${featured ? "md:mx-0" : ""}`}>{profile.committee_role}</Badge>
        ) : null}
        <h3 className={`${featured ? "text-2xl leading-8" : "text-base leading-6"} font-extrabold text-blue-950`}>
          {profile.full_name}
        </h3>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">{profile.position_title}</p>
        {profile.department ? (
          <p className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 ${featured ? "" : "justify-center"}`}>
            <BriefcaseBusiness className="size-3.5" />
            {profile.department}
          </p>
        ) : null}
        {profile.profile_note ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{profile.profile_note}</p>
        ) : null}
        <div className={`mt-3 flex flex-wrap gap-2 ${featured ? "justify-center md:justify-start" : "justify-center"}`}>
          {contacts.map((contact) => {
            const Icon = contact.icon;

            return (
              <a
                key={contact.key}
                href={contact.href}
                className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-sky-50 px-2 py-1 text-xs font-medium text-blue-800"
              >
                <Icon className="size-3.5" />
                {contact.label}
              </a>
            );
          })}
          {appointmentPath ? (
            <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs">
              <a href={appointmentPath} target="_blank" rel="noreferrer">
                <FileText className="size-3.5" />
                คำสั่ง
              </a>
            </Button>
          ) : null}
          <BoardTools row={row} user={user} config={config} />
        </div>
      </div>
    </article>
  );
}

export function SchoolBoardChart({ title, summary, profiles, user, config, crudRows }: SchoolBoardChartProps) {
  const activeProfiles = profiles.filter((profile) => isActive(profile.status)).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  const chair = activeProfiles.find(isChair) ?? activeProfiles[0] ?? null;
  const members = chair ? activeProfiles.filter((profile) => profile.id !== chair.id) : activeProfiles;
  const memberColumns = columnsFor(members, 4).filter((column) => column.length > 0);
  const rowsById = new Map((crudRows ?? []).map((row) => [row.id, row]));
  const canManage = Boolean(user && config && canAccess(user.effectivePermissions, config.permission));
  const createInitialValues: Record<string, AdminCrudValue> = {
    page_slug: "school-management-board",
    section_title: "คณะกรรมการสถานศึกษา",
    committee_role: "กรรมการ",
    status: "active",
    sort_order: activeProfiles.length + 1,
  };

  return (
    <section className="overflow-hidden border-y border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_48%,#eef7ff_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-8 md:px-6">
        <div className="text-center">
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm">
            <ShieldCheck className="size-4" />
            โครงสร้างคณะกรรมการสถานศึกษา
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-normal text-blue-950 md:text-5xl">{title}</h2>
          {summary ? <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-600">{summary}</p> : null}
          {canManage && config ? (
            <div className="mt-4 flex justify-center">
              <AdminCrudCreateButton
                user={user}
                permission={config.permission}
                moduleKey={config.key}
                moduleLabel={config.label}
                fields={config.fields}
                label="เพิ่มกรรมการสถานศึกษา"
                adminHref="/admin/modules/personnel_profiles"
                afterCreateHref="/content/school-management-board"
                initialValues={createInitialValues}
              />
            </div>
          ) : null}
        </div>

        {chair ? (
          <>
            <div className="relative">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg shadow-blue-950/20">
                <Award className="size-7" />
              </div>
              <div className="mt-3">
                <BoardCard profile={chair} row={rowsById.get(chair.id)} user={user} config={config} featured />
              </div>
              {memberColumns.length ? <span className="absolute left-1/2 top-full hidden h-10 border-l-2 border-blue-500 md:block" /> : null}
            </div>

            {memberColumns.length ? (
              <div className="relative mt-8">
                <div className="absolute left-[12.5%] right-[12.5%] top-0 hidden border-t-2 border-blue-500 md:block" />
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {memberColumns.map((column, columnIndex) => (
                    <div key={columnIndex} className="relative flex flex-col gap-5 pt-8">
                      <span className="absolute left-1/2 top-0 hidden h-full border-l-2 border-dashed border-blue-200 md:block" />
                      <span className="absolute left-1/2 top-0 hidden h-8 border-l-2 border-blue-500 md:block" />
                      {column.map((profile) => (
                        <BoardCard
                          key={profile.id}
                          profile={profile}
                          row={rowsById.get(profile.id)}
                          user={user}
                          config={config}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-blue-200 bg-white p-8 text-center shadow-sm">
            <UsersRound className="mx-auto size-10 text-blue-700" />
            <h3 className="mt-3 text-xl font-bold text-blue-950">ยังไม่มีรายชื่อคณะกรรมการสถานศึกษา</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">เพิ่มรายชื่อ กำหนดบทบาท อัปโหลดรูป และจัดลำดับได้จากปุ่มเพิ่มกรรมการหรือหน้าแอดมิน</p>
            {canManage && config ? (
              <div className="mt-4">
                <AdminCrudCreateButton
                  user={user}
                  permission={config.permission}
                  moduleKey={config.key}
                  moduleLabel={config.label}
                  fields={config.fields}
                  label="เพิ่มกรรมการ"
                  adminHref="/admin/modules/personnel_profiles"
                  afterCreateHref="/content/school-management-board"
                  initialValues={createInitialValues}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
