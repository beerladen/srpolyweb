import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Scale,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { ContentPageAdminTools } from "@/components/public/content-page-admin-tools";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { queryRows } from "@/lib/db";
import { publicAssetPath } from "@/lib/legacy-paths";
import { canAccess } from "@/lib/permissions";
import { getAdminContentPages, getSiteOverview } from "@/lib/site-data";

type RawPersonnelProfile = {
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

type RawPersonnelLayout = {
  page_slug: string;
  eyebrow: string | null;
  heading: string;
  summary: string | null;
  columns_desktop: number;
  card_style: string;
  image_shape: string;
  show_section_title: number;
  show_department: number;
  status: string;
};

type PersonnelProfileGroup = {
  title: string;
  profiles: RawPersonnelProfile[];
  featured?: boolean;
};

type RawPersonnelSummaryStat = {
  id: number;
  academic_year: string;
  personnel_type: string;
  department: string | null;
  staff_count: number;
  context_note: string | null;
  sort_order: number;
  status: string;
};

type RawLegalItem = {
  id: number;
  title: string;
  category: string | null;
  description: string | null;
  content: string | null;
  fiscal_year: string | null;
  effective_date: string | Date | null;
  file_path: string | null;
  source_url: string | null;
  sort_order: number;
  status: string;
};

async function getPersonnelSection(slug: string) {
  const [profiles, layouts] = await Promise.all([
    queryRows<RawPersonnelProfile>(
      `SELECT id, page_slug, section_title, full_name, position_title, department,
              committee_role, contact_phone, contact_email, contact_channel, term_period,
              photo_path, appointment_file, profile_note, sort_order, status
       FROM personnel_profiles
       WHERE page_slug = ?
       ORDER BY sort_order, id`,
      [slug]
    ),
    queryRows<RawPersonnelLayout>(
      `SELECT page_slug, eyebrow, heading, summary, columns_desktop, card_style, image_shape, show_section_title, show_department, status
       FROM personnel_page_layouts
       WHERE page_slug = ?
       ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END, id
       LIMIT 20`,
      [slug]
    ),
  ]);

  return {
    profiles: profiles ?? [],
    layout: layouts?.find((layout) => layout.status === "active") ?? null,
    layouts: layouts ?? [],
  };
}

function isPublishedStatus(status?: string | null): boolean {
  return status === "active" || status === "published" || status === "1";
}

function initialText(name: string): string {
  return name.replace(/^[-\s]+/, "").trim().charAt(0) || "ส";
}

function personnelGridClass(columnsDesktop: number): string {
  const columns = Math.min(Math.max(Number(columnsDesktop) || 3, 1), 4);

  if (columns === 1) {
    return "grid justify-items-center gap-4";
  }

  if (columns === 2) {
    return "mx-auto grid w-full max-w-3xl gap-5 sm:grid-cols-2";
  }

  if (columns === 3) {
    return "mx-auto grid w-full max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3";
  }

  return "mx-auto grid w-full max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4";
}

function PersonnelPhoto({
  person,
  photoPath,
  featured,
}: {
  person: RawPersonnelProfile;
  photoPath: string | null | undefined;
  featured: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-100 bg-cover bg-center bg-no-repeat font-bold text-blue-800 shadow-sm shadow-blue-950/10 ring-1 ring-blue-100 ${
        featured ? "mx-auto h-72 w-52 md:h-[300px] md:w-56" : "mx-auto h-56 w-40"
      }`}
      style={photoPath ? { backgroundImage: `url("${photoPath}")` } : undefined}
      aria-label={person.full_name}
    >
      {photoPath ? null : <span className={featured ? "text-5xl" : "text-4xl"}>{initialText(person.full_name)}</span>}
    </div>
  );
}

function PersonnelContactList({ person, featured }: { person: RawPersonnelProfile; featured: boolean }) {
  if (!person.contact_phone && !person.contact_email && !person.contact_channel && !person.term_period) {
    return null;
  }

  const itemClass =
    "inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm shadow-blue-950/5 hover:bg-sky-50";

  return (
    <div className={`flex flex-wrap gap-2 ${featured ? "justify-center md:justify-start" : "justify-center"}`}>
      {person.contact_phone ? (
        <a className={itemClass} href={`tel:${person.contact_phone}`}>
          <Phone className="size-3.5" />
          {person.contact_phone}
        </a>
      ) : null}
      {person.contact_email ? (
        <a className={itemClass} href={`mailto:${person.contact_email}`}>
          <Mail className="size-3.5" />
          {person.contact_email}
        </a>
      ) : null}
      {person.contact_channel ? (
        <span className={itemClass}>
          <MessageCircle className="size-3.5" />
          {person.contact_channel}
        </span>
      ) : null}
      {person.term_period ? (
        <span className={itemClass}>
          <CalendarDays className="size-3.5" />
          {person.term_period}
        </span>
      ) : null}
    </div>
  );
}

function groupPersonnelProfiles(profiles: RawPersonnelProfile[]): PersonnelProfileGroup[] {
  return profiles.reduce<PersonnelProfileGroup[]>((groups, profile) => {
    const title = profile.section_title?.trim() || "บุคลากร";
    const group = groups.find((item) => item.title === title);

    if (group) {
      group.profiles.push(profile);
    } else {
      groups.push({ title, profiles: [profile] });
    }

    return groups;
  }, []);
}

function splitDetailList(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n|;/)
    .map((item) => item.trim().replace(/^[-•]\s*/, ""))
    .filter(Boolean);
}

function normalizeDateText(value: string | Date | null): string {
  if (!value) {
    return "-";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [
    overview,
    adminUser,
    personnelSection,
    personnelConfig,
    layoutConfig,
    personnelSummaryConfig,
    legalConfig,
    personnelSummaryRows,
    legalRows,
  ] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getPersonnelSection(slug),
    getAdminCrudAvailableConfig("personnel_profiles"),
    getAdminCrudAvailableConfig("personnel_layouts"),
    getAdminCrudAvailableConfig("personnel_summary_stats"),
    getAdminCrudAvailableConfig("legal_items"),
    queryRows<RawPersonnelSummaryStat>(
      "SELECT id, academic_year, personnel_type, department, staff_count, context_note, sort_order, status FROM personnel_summary_stats WHERE status = 'active' ORDER BY academic_year DESC, sort_order, id"
    ),
    queryRows<RawLegalItem>(
      "SELECT id, title, category, description, content, fiscal_year, effective_date, file_path, source_url, sort_order, status FROM legal_items WHERE status = 'published' ORDER BY sort_order, COALESCE(effective_date, created_at) DESC, id DESC"
    ),
  ]);
  const [personnelRows, layoutRows, summaryCrudRows, legalCrudRows] = await Promise.all([
    personnelConfig ? getAdminCrudRows(personnelConfig, 500) : Promise.resolve(null),
    layoutConfig ? getAdminCrudRows(layoutConfig, 50) : Promise.resolve(null),
    personnelSummaryConfig ? getAdminCrudRows(personnelSummaryConfig, 500) : Promise.resolve(null),
    legalConfig ? getAdminCrudRows(legalConfig, 500) : Promise.resolve(null),
  ]);
  const personnelRowsById = new Map((personnelRows ?? []).map((row) => [row.id, row]));
  const summaryRowsById = new Map((summaryCrudRows ?? []).map((row) => [row.id, row]));
  const legalRowsById = new Map((legalCrudRows ?? []).map((row) => [row.id, row]));
  const personnelLayout = personnelSection.layout;
  const layoutRow = layoutRows?.find((row) => row.values.page_slug === slug);
  const activePersonnelProfiles = personnelSection.profiles.filter((person) => isPublishedStatus(person.status));
  const canManagePersonnelProfiles = Boolean(
    adminUser && personnelConfig && canAccess(adminUser.effectivePermissions, personnelConfig.permission)
  );
  const canManagePersonnelLayouts = Boolean(
    adminUser && layoutConfig && canAccess(adminUser.effectivePermissions, layoutConfig.permission)
  );
  const inactivePersonnelProfiles = canManagePersonnelProfiles
    ? personnelSection.profiles.filter((person) => !isPublishedStatus(person.status))
    : [];
  const inactiveLayoutRows = canManagePersonnelLayouts
    ? (layoutRows ?? []).filter((row) => row.values.page_slug === slug && !isPublishedStatus(row.status))
    : [];
  const personnelGroups =
    slug === "administrators" && activePersonnelProfiles.length > 1
      ? [
          { title: "ผู้อำนวยการ", profiles: [activePersonnelProfiles[0]], featured: true },
          ...groupPersonnelProfiles(activePersonnelProfiles.slice(1)),
        ]
      : groupPersonnelProfiles(activePersonnelProfiles);
  let page = overview.contentPages.find((item) => item.slug === slug);

  if (!page && adminUser && canAccess(adminUser.effectivePermissions, "content_pages")) {
    page = (await getAdminContentPages()).find((item) => item.slug === slug);
  }

  if (!page) {
    notFound();
  }

  const coverImage = publicAssetPath(page.coverImage);
  const attachmentPath = publicAssetPath(page.attachmentPath);
  const personnelSummaryStats = personnelSummaryRows ?? [];
  const latestPersonnelYear = personnelSummaryStats[0]?.academic_year ?? "2569";
  const currentPersonnelSummary = personnelSummaryStats.filter((item) => item.academic_year === latestPersonnelYear);
  const personnelTotal = currentPersonnelSummary.reduce((sum, item) => sum + Number(item.staff_count ?? 0), 0);
  const legalItems = legalRows ?? [];
  const shouldRenderPersonnelCards = slug !== "personnel-data" && activePersonnelProfiles.length > 0 && Boolean(personnelLayout);
  const shouldShowInactivePersonnelTools =
    slug !== "personnel-data" && (inactivePersonnelProfiles.length > 0 || inactiveLayoutRows.length > 0);
  const shouldShowPersonnelBeforeBody =
    shouldRenderPersonnelCards &&
    ["people", "committee"].includes(page.contentType ?? "");
  const pageBody = (
    <>
      <Card className="border-blue-100 shadow-sm shadow-blue-950/5">
        <CardContent
          className="flex flex-col gap-4 p-6 text-sm leading-7 text-muted-foreground md:text-base [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-7"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </Card>
      {attachmentPath || page.sourceUrl ? (
        <div className="flex flex-wrap gap-2">
          {attachmentPath ? (
            <Button asChild>
              <a href={attachmentPath} target="_blank" rel="noreferrer">
                <FileText data-icon="inline-start" />
                เปิดไฟล์แนบ
              </a>
            </Button>
          ) : null}
          {page.sourceUrl ? (
            <Button asChild variant="outline">
              <a href={page.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink data-icon="inline-start" />
                เปิดลิงก์อ้างอิง
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <SiteShell active={page.navKey ?? "content"} settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading
          title={page.title}
          description={page.summary}
          action={<ContentPageAdminTools user={adminUser} page={page} />}
        />
        {coverImage ? (
          <Card className="border-blue-100 shadow-sm shadow-blue-950/5">
            <CardContent className="p-4">
              <div className="overflow-hidden rounded-md border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt={page.title} className="h-auto max-h-[76vh] w-full object-contain" />
              </div>
            </CardContent>
          </Card>
        ) : null}
        {slug === "personnel-data" ? (
          <section className="flex flex-col gap-5 rounded-md border border-blue-100 bg-sky-50/80 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge variant="outline">ปีการศึกษา {latestPersonnelYear}</Badge>
                <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">สรุปข้อมูลบุคลากร</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  แสดงจำนวนครู บุคลากร และเจ้าหน้าที่ตามประเภท สามารถจัดการย้อนหลังได้จากระบบหลังบ้าน
                </p>
              </div>
              {personnelSummaryConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={personnelSummaryConfig.permission}
                  moduleKey={personnelSummaryConfig.key}
                  moduleLabel={personnelSummaryConfig.label}
                  fields={personnelSummaryConfig.fields}
                  label="เพิ่มสรุปบุคลากร"
                  adminHref="/admin/modules/personnel_summary_stats"
                />
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-blue-100 bg-blue-700 p-4 text-white shadow-sm">
                <span className="text-xs font-semibold text-blue-100">รวมทั้งหมด</span>
                <strong className="mt-1 block text-3xl">{personnelTotal.toLocaleString("th-TH")}</strong>
                <span className="text-sm text-blue-100">คน</span>
              </div>
              {currentPersonnelSummary.slice(0, 7).map((item) => {
                const crudRow = summaryRowsById.get(item.id);

                return (
                  <article key={item.id} className="rounded-md border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                        <UsersRound className="size-5" />
                      </span>
                      {personnelSummaryConfig && crudRow ? (
                        <AdminCrudTools
                          user={adminUser}
                          permission={personnelSummaryConfig.permission}
                          moduleKey={personnelSummaryConfig.key}
                          moduleLabel={personnelSummaryConfig.label}
                          fields={personnelSummaryConfig.fields}
                          row={crudRow}
                          label="จัดการ"
                          triggerSize="sm"
                          adminHref="/admin/modules/personnel_summary_stats"
                          afterDeleteHref="/admin/modules/personnel_summary_stats"
                        />
                      ) : null}
                    </div>
                    <strong className="mt-3 block text-lg text-slate-950">{item.personnel_type}</strong>
                    <span className="mt-1 block text-3xl font-bold text-blue-700">{Number(item.staff_count).toLocaleString("th-TH")}</span>
                    <span className="text-sm text-slate-500">{item.department ?? "บุคลากร"}</span>
                    {item.context_note ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.context_note}</p> : null}
                  </article>
                );
              })}
            </div>
            <div className="overflow-hidden rounded-md border border-blue-100 bg-white">
              <div className="grid grid-cols-[1fr_120px_130px] gap-3 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                <span>ประเภทบุคลากร</span>
                <span>จำนวน</span>
                <span className="text-right">ปีการศึกษา</span>
              </div>
              <div className="divide-y divide-blue-100">
                {personnelSummaryStats.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_120px_130px] gap-3 px-4 py-3 text-sm">
                    <span>
                      <strong className="block text-slate-950">{item.personnel_type}</strong>
                      <span className="text-slate-500">{item.department ?? item.context_note ?? "-"}</span>
                    </span>
                    <strong className="text-blue-700">{Number(item.staff_count).toLocaleString("th-TH")} คน</strong>
                    <span className="text-right text-slate-600">{item.academic_year}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
        {slug === "laws" ? (
          <section className="flex flex-col gap-4 rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge variant="outline">ข้อมูลเผยแพร่</Badge>
                <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">รายการกฎหมายและระเบียบ</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">คลิกเปิดแต่ละรายการเพื่ออ่านสาระสำคัญ ดาวน์โหลดไฟล์ หรือเปิดลิงก์อ้างอิง</p>
              </div>
              {legalConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={legalConfig.permission}
                  moduleKey={legalConfig.key}
                  moduleLabel={legalConfig.label}
                  fields={legalConfig.fields}
                  label="เพิ่มกฎหมาย/ระเบียบ"
                  adminHref="/admin/modules/legal_items"
                />
              ) : null}
            </div>
            <div className="overflow-hidden rounded-md border border-blue-100">
              <div className="hidden grid-cols-[1fr_160px_130px_120px] gap-3 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
                <span>รายการ</span>
                <span>หมวด</span>
                <span>วันที่/ปี</span>
                <span className="text-right">การจัดการ</span>
              </div>
              <div className="divide-y divide-blue-100">
                {legalItems.map((item) => {
                  const crudRow = legalRowsById.get(item.id);
                  const filePath = publicAssetPath(item.file_path);

                  return (
                    <details key={item.id} className="group bg-white">
                      <summary className="grid cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-sky-50 md:grid-cols-[1fr_160px_130px_120px] md:items-center">
                        <span className="flex min-w-0 items-start gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                            <Scale className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <strong className="block text-slate-950">{item.title}</strong>
                            <span className="line-clamp-2 text-sm text-slate-600">{item.description ?? "คลิกเพื่ออ่านรายละเอียด"}</span>
                          </span>
                        </span>
                        <span className="text-sm text-slate-600">{item.category ?? "-"}</span>
                        <span className="text-sm text-slate-600">{item.fiscal_year ?? normalizeDateText(item.effective_date)}</span>
                        <span className="flex justify-start gap-2 md:justify-end">
                          {legalConfig && crudRow ? (
                            <AdminCrudTools
                              user={adminUser}
                              permission={legalConfig.permission}
                              moduleKey={legalConfig.key}
                              moduleLabel={legalConfig.label}
                              fields={legalConfig.fields}
                              row={crudRow}
                              label="จัดการ"
                              triggerSize="sm"
                              adminHref="/admin/modules/legal_items"
                              afterDeleteHref="/admin/modules/legal_items"
                            />
                          ) : null}
                        </span>
                      </summary>
                      <div className="border-t bg-slate-50 px-4 py-4">
                        {item.content ? (
                          <div
                            className="prose prose-sm max-w-none text-slate-700 [&_a]:text-blue-700"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />
                        ) : (
                          <p className="text-sm leading-6 text-slate-600">{item.description ?? "ยังไม่มีรายละเอียดเพิ่มเติม"}</p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {filePath ? (
                            <Button asChild size="sm">
                              <a href={filePath} target="_blank" rel="noreferrer">
                                <FileText data-icon="inline-start" />
                                เปิดไฟล์แนบ
                              </a>
                            </Button>
                          ) : null}
                          {item.source_url ? (
                            <Button asChild size="sm" variant="outline">
                              <a href={item.source_url} target="_blank" rel="noreferrer">
                                <ExternalLink data-icon="inline-start" />
                                เปิดลิงก์อ้างอิง
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}
        {shouldShowPersonnelBeforeBody ? null : (
          <>
        <Card className="border-blue-100 shadow-sm shadow-blue-950/5">
          <CardContent
            className="flex flex-col gap-4 p-6 text-sm leading-7 text-muted-foreground md:text-base [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-7"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        </Card>
        {attachmentPath || page.sourceUrl ? (
          <div className="flex flex-wrap gap-2">
            {attachmentPath ? (
              <Button asChild>
                <a href={attachmentPath} target="_blank" rel="noreferrer">
                  <FileText data-icon="inline-start" />
                  เปิดไฟล์แนบ
                </a>
              </Button>
            ) : null}
            {page.sourceUrl ? (
              <Button asChild variant="outline">
                <a href={page.sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink data-icon="inline-start" />
                  เปิดลิงก์อ้างอิง
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
          </>
        )}
        {shouldRenderPersonnelCards && personnelLayout ? (
          <section className="flex flex-col gap-6 rounded-md border border-blue-100 bg-sky-50/70 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                {personnelLayout.eyebrow ? (
                  <Badge variant="outline" className="w-fit">{personnelLayout.eyebrow}</Badge>
                ) : null}
                <h2 className="mt-1 text-2xl font-bold tracking-normal">{personnelLayout.heading}</h2>
                {personnelLayout.summary ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{personnelLayout.summary}</p>
                ) : null}
              </div>
              {layoutConfig && layoutRow ? (
                <AdminCrudTools
                  user={adminUser}
                  permission={layoutConfig.permission}
                  moduleKey={layoutConfig.key}
                  moduleLabel={layoutConfig.label}
                  fields={layoutConfig.fields}
                  row={layoutRow}
                  label="จัดการเลย์เอาต์"
                  adminHref="/admin/modules/personnel_layouts"
                  afterDeleteHref="/admin/modules/personnel_layouts"
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-7">
              {personnelGroups.map((group, groupIndex) => {
                const isFeaturedGroup = Boolean(group.featured) || (groupIndex === 0 && group.profiles.length === 1);

                return (
                <section key={group.title} className="flex flex-col gap-3">
                  {personnelLayout.show_section_title ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-bold tracking-normal text-slate-950">{group.title}</h3>
                      <Badge variant="secondary">{group.profiles.length.toLocaleString("th-TH")} รายชื่อ</Badge>
                    </div>
                  ) : null}
                  <div
                    className={personnelGridClass(
                      isFeaturedGroup ? 1 : Math.min(group.profiles.length, personnelLayout.columns_desktop),
                    )}
                  >
                    {group.profiles.map((person) => {
                      const photoPath = publicAssetPath(person.photo_path);
                      const appointmentPath = publicAssetPath(person.appointment_file);
                      const crudRow = personnelRowsById.get(person.id);
                      const isFeatured = isFeaturedGroup;
                      const responsibilityItems = splitDetailList(person.profile_note);

                      return (
                        <article
                          key={person.id}
                          className={`overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm shadow-blue-950/5 ${
                            isFeatured ? "mx-auto grid w-full max-w-2xl gap-5 p-5 md:grid-cols-[240px_1fr] md:items-center" : "flex min-h-full flex-col p-4"
                          }`}
                        >
                          <PersonnelPhoto person={person} photoPath={photoPath} featured={isFeatured} />

                          <div className={`flex flex-1 flex-col ${isFeatured ? "justify-center text-center md:min-h-[300px] md:text-left" : "pt-4 text-center"}`}>
                            <div className="min-w-0">
                              {person.committee_role ? (
                                <Badge variant="outline" className={`mb-2 w-fit ${isFeatured ? "mx-auto md:mx-0" : "mx-auto"}`}>
                                  {person.committee_role}
                                </Badge>
                              ) : null}
                              <h4 className={`${isFeatured ? "text-2xl leading-9" : "text-lg leading-7"} font-bold text-foreground`}>
                                {person.full_name}
                              </h4>
                              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted-foreground">{person.position_title}</p>
                              {personnelLayout.show_department && person.department ? (
                                <p className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 ${isFeatured ? "justify-center md:justify-start" : "justify-center"}`}>
                                  <BriefcaseBusiness className="size-3.5" />
                                  {person.department}
                                </p>
                              ) : null}
                            </div>

                            {responsibilityItems.length ? (
                              <div className="mt-4 rounded-md border border-blue-100 bg-sky-50/70 p-3 text-left">
                                <p className="text-xs font-semibold text-blue-700">หน้าที่รับผิดชอบ</p>
                                <ul className="mt-2 grid gap-1.5">
                                  {responsibilityItems.map((item) => (
                                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-blue-700" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            <div className={isFeatured ? "mt-4" : "mt-auto pt-4"}>
                              <PersonnelContactList person={person} featured={isFeatured} />

                              <div className={`flex flex-wrap gap-2 ${isFeatured ? "mt-3 justify-center md:justify-start" : "mt-3 justify-center"}`}>
                                {appointmentPath ? (
                                  <Button asChild variant="outline" size="sm">
                                    <a href={appointmentPath} target="_blank" rel="noreferrer">
                                      <FileText data-icon="inline-start" />
                                      เอกสารแต่งตั้ง
                                    </a>
                                  </Button>
                                ) : null}
                                {personnelConfig && crudRow ? (
                                  <AdminCrudTools
                                    user={adminUser}
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
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
                );
              })}
            </div>
          </section>
        ) : null}
        {shouldShowInactivePersonnelTools && adminUser ? (
          <section className="flex flex-col gap-4 rounded-md border border-amber-200 bg-amber-50/80 p-5 shadow-sm shadow-amber-950/5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge variant="outline" className="border-amber-200 bg-white text-amber-800">
                  เฉพาะผู้ดูแล
                </Badge>
                <h3 className="mt-2 text-lg font-bold tracking-normal text-slate-950">รายการที่ปิดใช้งานอยู่</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  รายการเหล่านี้ถูกซ่อนจากหน้าเว็บแล้ว แต่ยังอยู่ในระบบ สามารถกดจัดการแล้วเปลี่ยนสถานะเป็นเปิดใช้งานเพื่อเรียกกลับมาแสดงได้
                </p>
              </div>
              {personnelConfig ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/modules/personnel_profiles">เปิดหน้าจัดการทั้งหมด</Link>
                </Button>
              ) : null}
            </div>

            {inactiveLayoutRows.length && layoutConfig ? (
              <div className="rounded-md border border-amber-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-950">เลย์เอาต์ที่ปิดใช้งาน</p>
                <div className="mt-3 grid gap-2">
                  {inactiveLayoutRows.map((row) => (
                    <div key={row.id} className="flex flex-col gap-2 rounded-md border border-amber-100 bg-amber-50/50 p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-slate-950">{row.title}</p>
                        <p className="text-xs text-slate-600">สถานะ: {row.status ?? "inactive"}</p>
                      </div>
                      <AdminCrudTools
                        user={adminUser}
                        permission={layoutConfig.permission}
                        moduleKey={layoutConfig.key}
                        moduleLabel={layoutConfig.label}
                        fields={layoutConfig.fields}
                        row={row}
                        label="จัดการ"
                        triggerSize="sm"
                        adminHref="/admin/modules/personnel_layouts"
                        afterDeleteHref="/admin/modules/personnel_layouts"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {inactivePersonnelProfiles.length && personnelConfig ? (
              <div className="rounded-md border border-amber-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-950">บุคลากร/การ์ดที่ปิดใช้งาน</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {inactivePersonnelProfiles.map((person) => {
                    const row = personnelRowsById.get(person.id);

                    return (
                      <div key={person.id} className="flex flex-col gap-2 rounded-md border border-amber-100 bg-amber-50/50 p-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-950">{person.full_name}</p>
                          <p className="line-clamp-1 text-xs text-slate-600">{person.position_title}</p>
                          <p className="mt-1 text-xs text-amber-800">สถานะ: {person.status}</p>
                        </div>
                        {row ? (
                          <AdminCrudTools
                            user={adminUser}
                            permission={personnelConfig.permission}
                            moduleKey={personnelConfig.key}
                            moduleLabel={personnelConfig.label}
                            fields={personnelConfig.fields}
                            row={row}
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
              </div>
            ) : null}
          </section>
        ) : null}
        {shouldShowPersonnelBeforeBody ? pageBody : null}
      </section>
    </SiteShell>
  );
}
