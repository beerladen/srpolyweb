import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Megaphone,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminCrudTools } from "@/components/public/admin-crud-tools";
import { AdminInlineTools } from "@/components/public/admin-inline-tools";
import { HomeNewsShowcase } from "@/components/public/home-news-showcase";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { getDownloadCenterData } from "@/lib/document-data";
import { publicAssetPath } from "@/lib/legacy-paths";
import { getSiteOverview, statusLabel, statusVariant, type CourseGroup } from "@/lib/site-data";

function isExternalLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function fieldText(value: string | number | boolean | null | undefined, fallback = ""): string {
  if (value === null || typeof value === "undefined") {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
}

function backgroundImageStyle(src: string) {
  return { backgroundImage: `url("${src}")` };
}

type DepartmentLink = {
  key: string;
  name: string;
  href?: string;
  levels: string[];
  groupTitles: string[];
};

function buildDepartmentLinks(courseGroups: CourseGroup[]): DepartmentLink[] {
  const byName = new Map<string, DepartmentLink>();

  for (const group of courseGroups) {
    for (const department of group.departments) {
      const key = `${department.name}|${department.href ?? ""}`;
      const existing = byName.get(key);

      if (existing) {
        if (!existing.levels.includes(group.level)) {
          existing.levels.push(group.level);
        }
        if (!existing.groupTitles.includes(group.title)) {
          existing.groupTitles.push(group.title);
        }
        continue;
      }

      byName.set(key, {
        key,
        name: department.name,
        href: department.href,
        levels: [group.level],
        groupTitles: [group.title],
      });
    }
  }

  return Array.from(byName.values());
}

export default async function Home() {
  const [overview, adminUser, siteBlockConfig, newsConfig, newsCategoryConfig, downloadData] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("site_blocks"),
    getAdminCrudAvailableConfig("news"),
    getAdminCrudAvailableConfig("news_categories"),
    getDownloadCenterData(),
  ]);
  const [siteBlockRows, newsRows] = await Promise.all([
    siteBlockConfig ? getAdminCrudRows(siteBlockConfig) : Promise.resolve(null),
    newsConfig ? getAdminCrudRows(newsConfig) : Promise.resolve(null),
  ]);
  const heroBlock = siteBlockRows?.find((row) => row.values.block_key === "home_hero") ?? siteBlockRows?.[0];
  const itaPublished = overview.ita.filter((item) => item.status === "published").length;
  const departmentLinks = buildDepartmentLinks(overview.courseGroups);
  const heroTitle = fieldText(heroBlock?.values.title, overview.settings.collegeName);
  const heroSubtitle = fieldText(heroBlock?.values.subtitle, overview.settings.slogan);
  const heroBody = fieldText(
    heroBlock?.values.body,
    "รวมข่าวสาร บริการออนไลน์ เอกสารสาธารณะ หลักสูตรอาชีพ และข้อมูล ITA ของวิทยาลัยไว้ในพื้นที่เดียว เพื่อให้นักเรียน ผู้ปกครอง ประชาชน และหน่วยงานที่เกี่ยวข้องเข้าถึงข้อมูลได้ง่ายขึ้น"
  );
  const heroImage =
    publicAssetPath(fieldText(heroBlock?.values.image_path, "/assets/images/hero-campus.png")) ??
    publicAssetPath("/assets/images/hero-campus.png") ??
    "/assets/images/hero-campus.png";
  const heroPrimaryLabel = fieldText(heroBlock?.values.primary_label, "สมัครเรียน");
  const heroPrimaryHref = fieldText(heroBlock?.values.primary_url, "/services");
  const heroSecondaryLabel = fieldText(heroBlock?.values.secondary_label, "บริการออนไลน์");
  const heroSecondaryHref = fieldText(heroBlock?.values.secondary_url, "/services");
  const accessItems = [
    {
      title: "หลักสูตรอาชีพ",
      description: `${departmentLinks.length.toLocaleString("th-TH")} แผนก/หลักสูตร`,
      href: "/departments",
      icon: GraduationCap,
      tone: "bg-blue-700 text-white",
    },
    {
      title: "บริการออนไลน์",
      description: "ระบบและแบบฟอร์มที่ใช้บ่อย",
      href: "/services",
      icon: Sparkles,
      tone: "bg-cyan-600 text-white",
    },
    {
      title: "ข้อมูลโปร่งใส",
      description: `ITA/OIT ${itaPublished}/${overview.ita.length} รายการ`,
      href: "/ita",
      icon: ShieldCheck,
      tone: "bg-amber-500 text-white",
    },
    {
      title: "ร้องเรียน / เสนอแนะ",
      description: "แจ้งเรื่องและติดตามสถานะ",
      href: "/complaint",
      icon: Megaphone,
      tone: "bg-emerald-600 text-white",
    },
  ];
  const profileLinks = [
    { title: "คณะผู้บริหาร", href: "/content/administrators", icon: UsersRound },
    { title: "ข้อมูลผู้เรียน", href: "/students", icon: ClipboardList },
    { title: "ข้อมูลบุคลากร", href: "/content/personnel-data", icon: UsersRound },
    { title: "กฎหมายและระเบียบ", href: "/content/laws", icon: FileText },
  ];
  const transparencyLinks = [
    {
      title: "ITA / OIT",
      description: "ติดตามข้อมูลคุณธรรม ความโปร่งใส และหลักฐานการเผยแพร่",
      href: "/ita",
      metric: `${itaPublished}/${overview.ita.length}`,
      metricLabel: "รายการเผยแพร่",
      icon: ShieldCheck,
      tone: "border-blue-200 bg-blue-50",
    },
    {
      title: "เอกสารสาธารณะ",
      description: "เอกสาร แบบฟอร์ม แผน รายงาน และไฟล์เผยแพร่ของวิทยาลัย",
      href: "/documents",
      metric: overview.documents.length.toLocaleString("th-TH"),
      metricLabel: "เอกสาร",
      icon: FileText,
      tone: "border-amber-200 bg-amber-50",
    },
    {
      title: "จัดซื้อจัดจ้าง",
      description: "ประกาศ แผนจัดซื้อจัดจ้าง ราคากลาง และผลการจัดซื้อจัดจ้าง",
      href: "/procurement",
      metric: overview.procurement.length.toLocaleString("th-TH"),
      metricLabel: "รายการ",
      icon: ClipboardList,
      tone: "border-emerald-200 bg-emerald-50",
    },
  ];

  return (
    <SiteShell active="home" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="border-b border-border bg-background py-4 md:py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div
            data-home-hero
            className="relative isolate min-h-[380px] overflow-hidden rounded-lg border border-border bg-card shadow-xl shadow-blue-950/10 md:min-h-[430px]"
          >
            <div
              className="absolute inset-0 bg-cover bg-[position:center_right]"
              style={backgroundImageStyle(heroImage)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-background via-background/95 to-background/40 md:w-[78%] md:to-transparent lg:w-[64%]" />
            <div className="relative flex min-h-[380px] flex-col justify-center px-5 py-8 md:min-h-[430px] md:px-10 lg:px-12">
              <div className="max-w-3xl">
                <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-normal text-primary md:text-5xl lg:text-6xl">
                  {heroTitle}
                </h1>
                <p className="mt-4 text-lg font-bold leading-8 text-foreground md:text-2xl">
                  {heroSubtitle}
                </p>
                <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-muted-foreground md:text-base">
                  {heroBody}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild className="shadow-lg shadow-primary/20">
                    <Link
                      href={heroPrimaryHref}
                      target={isExternalLink(heroPrimaryHref) ? "_blank" : undefined}
                      rel={isExternalLink(heroPrimaryHref) ? "noreferrer" : undefined}
                    >
                      <GraduationCap data-icon="inline-start" />
                      {heroPrimaryLabel}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-background/90 shadow-lg shadow-blue-950/10 backdrop-blur hover:bg-background">
                    <Link
                      href={heroSecondaryHref}
                      target={isExternalLink(heroSecondaryHref) ? "_blank" : undefined}
                      rel={isExternalLink(heroSecondaryHref) ? "noreferrer" : undefined}
                    >
                      {heroSecondaryLabel}
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-5">
                  {siteBlockConfig && heroBlock ? (
                    <AdminCrudTools
                      user={adminUser}
                      permission={siteBlockConfig.permission}
                      moduleKey={siteBlockConfig.key}
                      moduleLabel={siteBlockConfig.label}
                      fields={siteBlockConfig.fields}
                      row={heroBlock}
                      label="แก้ไข Hero"
                      adminHref="/admin/modules/site_blocks"
                      afterDeleteHref="/admin/modules/site_blocks"
                      className="border-border bg-background/90 text-foreground shadow-lg shadow-blue-950/10 backdrop-blur hover:bg-background"
                    />
                  ) : (
                    <AdminInlineTools
                      user={adminUser}
                      permission="site_blocks"
                      module="site_blocks"
                      label="แก้ไข Hero"
                      showCreate={false}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 pb-6 md:px-6">
          <div className="grid overflow-hidden rounded-lg border border-blue-100 bg-white shadow-xl shadow-blue-950/10 md:grid-cols-4">
            {accessItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex min-h-24 items-center gap-4 border-b border-blue-100 p-4 transition-colors hover:bg-sky-50 md:border-b-0 md:border-r md:last:border-r-0"
                >
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-md ${item.tone}`}>
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-base text-slate-950 group-hover:text-blue-700">{item.title}</strong>
                    <span className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{item.description}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <HomeNewsShowcase
        news={overview.news}
        categories={overview.newsCategories}
        user={adminUser}
        newsConfig={newsConfig}
        newsRows={newsRows}
        categoryConfig={newsCategoryConfig}
      />

      <section className="border-y border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr_0.95fr]">
          <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-normal text-slate-950">บริการออนไลน์</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">ระบบบริการและลิงก์สำคัญที่ผู้เรียน ผู้ปกครอง และประชาชนใช้บ่อย</p>
              </div>
              <AdminInlineTools
                user={adminUser}
                permission="cms.quick_links"
                module="quick_links"
                label="จัดการ"
                className="[&_button]:h-9"
              />
            </div>
            <div className="mt-4 divide-y divide-blue-100">
              {overview.quickLinks.slice(0, 6).map((link) => (
                <Link
                  key={link.itemKey}
                  href={link.href}
                  target={isExternalLink(link.href) ? "_blank" : undefined}
                  rel={isExternalLink(link.href) ? "noreferrer" : undefined}
                  className="group flex items-center justify-between gap-3 py-3 text-sm font-semibold text-slate-800 hover:text-blue-700"
                >
                  <span className="line-clamp-1">{link.label}</span>
                  <ArrowRight className="size-4 shrink-0 text-blue-700 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4 w-full border-blue-200 bg-white">
              <Link href="/services">
                ดูบริการทั้งหมด
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-normal text-slate-950">แผนกวิชา</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">เข้าถึงข้อมูลแผนก หลักสูตร และช่องทางของแต่ละสาขาได้อย่างรวดเร็ว</p>
              </div>
              <AdminInlineTools
                user={adminUser}
                permission="course_groups"
                module="course_groups"
                label="จัดการ"
                className="[&_button]:h-9"
              />
            </div>
            <div data-departments-list className="mt-4 grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {departmentLinks.slice(0, 14).map((department) => {
                const content = (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                        {department.name}
                      </span>
                    </span>
                    {department.href ? (
                      <ArrowRight className="size-4 shrink-0 text-blue-700 transition-transform group-hover:translate-x-1" />
                    ) : (
                      <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">รอลิงก์</span>
                    )}
                  </>
                );

                return department.href ? (
                  <Link
                    key={department.key}
                    href={department.href}
                    target={isExternalLink(department.href) ? "_blank" : undefined}
                    rel={isExternalLink(department.href) ? "noreferrer" : undefined}
                    className="group flex min-h-9 items-center gap-3 border-b border-blue-100 py-2"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={department.key} className="flex min-h-9 items-center gap-3 border-b border-blue-100 py-2 opacity-75">
                    {content}
                  </div>
                );
              })}
            </div>
            <Button asChild variant="outline" className="mt-4 w-full border-blue-200 bg-white">
              <Link href="/departments">
                ดูแผนกทั้งหมด
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/ita"
              className="group rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm shadow-blue-950/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white shadow-sm">
                  <ShieldCheck className="size-5" />
                </span>
                <span className="text-right">
                  <strong className="block text-3xl font-extrabold text-blue-800">{itaPublished}/{overview.ita.length}</strong>
                  <span className="text-xs font-semibold text-blue-700">OIT เผยแพร่แล้ว</span>
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-blue-700">ข้อมูล ITA / OIT</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">รายงานคุณธรรม ความโปร่งใส และข้อมูลเปิดเผยต่อสาธารณะ</p>
            </Link>

            <Link
              href="/documents"
              className="group flex min-h-28 items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm shadow-amber-950/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span>
                <strong className="block text-lg text-amber-950 group-hover:text-amber-700">เอกสารสาธารณะ</strong>
                <span className="mt-1 block text-sm leading-6 text-slate-700">เปิดเผยข้อมูล เอกสาร แผน รายงาน และแบบฟอร์มสำคัญ</span>
              </span>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-white text-amber-600 shadow-sm">
                <FileText className="size-6" />
              </span>
            </Link>

            <Link
              href="/complaint"
              className="group rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm shadow-emerald-950/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <span>
                  <strong className="block text-lg text-emerald-950 group-hover:text-emerald-700">ร้องเรียน / เสนอแนะ</strong>
                  <span className="mt-1 block text-sm leading-6 text-slate-700">แจ้งปัญหาหรือข้อเสนอแนะ เพื่อการพัฒนาวิทยาลัย</span>
                </span>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-white text-emerald-700 shadow-sm">
                  <Megaphone className="size-6" />
                </span>
              </div>
              <span className="mt-4 inline-flex rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800">
                แจ้งเรื่อง
              </span>
            </Link>
          </div>

          <div className="hidden">
            {profileLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5 transition-colors hover:border-blue-300 hover:bg-sky-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white">
                      <Icon className="size-5" />
                    </span>
                    <strong className="text-sm text-slate-950 group-hover:text-blue-700">{item.title}</strong>
                  </span>
                  <ArrowRight className="size-4 text-blue-700 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <PhoneCall className="mt-1 size-5 shrink-0 text-emerald-700" />
                <div>
                  <strong className="text-sm text-slate-950">ติดต่อวิทยาลัย</strong>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {overview.settings.contactPhone} · {overview.settings.contactEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {profileLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5 transition-colors hover:border-blue-300 hover:bg-sky-50"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                      <Icon className="size-4" />
                    </span>
                    <strong className="truncate text-sm text-slate-950 group-hover:text-blue-700">{item.title}</strong>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-blue-700 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm shadow-blue-950/5">
            <div className="grid gap-4 lg:grid-cols-[280px_1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
                    <Download className="size-5" />
                  </span>
                  <h2 className="text-xl font-bold tracking-normal">เอกสาร/แบบฟอร์มยอดนิยม</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  คำร้องและไฟล์บริการที่ผู้เรียนดาวน์โหลดบ่อย
                </p>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {downloadData.popular.slice(0, 4).map((document, index) => (
                  <Link
                    key={document.id}
                    href={`/documents/${document.id}`}
                    className="group flex items-center gap-3 rounded-md border border-border bg-muted/35 px-3 py-2 transition-colors hover:bg-accent/70"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded border border-border bg-background text-xs font-extrabold text-primary">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-foreground group-hover:text-primary">{document.title}</strong>
                      <span className="block truncate text-xs text-muted-foreground">
                        {document.department} · {document.downloadCount.toLocaleString("th-TH")} ดาวน์โหลด
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
              <Button asChild>
                <Link href="/documents">
                  ดูเอกสารทั้งหมด
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">ข้อมูลสาธารณะและความโปร่งใส</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
              รวมเอกสารเผยแพร่ แผน รายงาน จัดซื้อจัดจ้าง และข้อมูล ITA/OIT ที่ประชาชนตรวจสอบได้
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminInlineTools user={adminUser} permission="ita" module="ita" label="จัดการ ITA" />
            <Button asChild variant="outline">
              <Link href="/ita">
                เปิดหน้า ITA
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {transparencyLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group rounded-lg border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${item.tone}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-md bg-white text-blue-700 shadow-sm">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-right">
                    <strong className="block text-2xl text-slate-950">{item.metric}</strong>
                    <span className="text-xs font-medium text-slate-600">{item.metricLabel}</span>
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-blue-700">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </Link>
            );
          })}
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {overview.ita.slice(0, 6).map((item) => (
            <Link key={item.id} href={item.href} className="rounded-lg border border-blue-100 bg-white p-4 transition-colors hover:bg-sky-50">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">{item.code}</Badge>
                <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
              </div>
              <strong className="mt-3 block text-sm leading-6 text-slate-950">{item.title}</strong>
              <span className="mt-1 block text-xs text-slate-500">{item.category}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-normal">ช่องทางร้องเรียน / ข้อเสนอแนะ</h2>
            <p className="max-w-3xl text-sm leading-6 text-blue-100">
              ส่งเรื่องร้องเรียนหรือข้อเสนอแนะ และติดตามสถานะด้วยรหัสติดตามผ่านระบบเดียวของวิทยาลัย
            </p>
            <AdminInlineTools
              user={adminUser}
              permission="complaints"
              module="complaints"
              label="จัดการร้องเรียน"
              showCreate={false}
              className="[&_button]:border-white/30 [&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-blue-950 hover:bg-sky-50">
              <Link href="/complaint">
                <Megaphone data-icon="inline-start" />
                ส่งเรื่องร้องเรียน
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/complaint-status">ติดตามสถานะ</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
