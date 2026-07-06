import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, Mail, MapPin, Phone, Search, Settings, ShieldCheck, UserRound } from "lucide-react";
import { AdminInlineTools } from "@/components/public/admin-inline-tools";
import { Button } from "@/components/ui/button";
import { getSignedInAdminUser, type AdminUser } from "@/lib/admin-auth";
import { withBasePath } from "@/lib/base-path";
import { canAccess } from "@/lib/permissions";
import type { NavItem, SiteSettings } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type SiteShellProps = {
  active?: string;
  settings: SiteSettings;
  navigation: NavItem[];
  adminUser?: AdminUser | null;
  children: React.ReactNode;
};

function isExternalLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export async function SiteShell({ active, settings, navigation, adminUser, children }: SiteShellProps) {
  const signedInAdminUser = adminUser === undefined ? await getSignedInAdminUser() : adminUser;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="border-b border-blue-100 bg-background/95">
        {signedInAdminUser ? (
          <div className="bg-blue-950 text-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-400 px-2.5 py-1 font-semibold text-blue-950">
                  <UserRound className="size-3.5" />
                  โหมดผู้ดูแล
                </span>
                <span className="text-blue-100">{signedInAdminUser.name}</span>
                <span className="rounded-md border border-white/20 px-2 py-1 text-blue-100">{signedInAdminUser.roleName}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 font-semibold text-blue-950 transition-colors hover:bg-sky-100"
                >
                  <LayoutDashboard className="size-3.5" />
                  หลังบ้าน
                </Link>
                {canAccess(signedInAdminUser.effectivePermissions, "site_blocks") ? (
                  <Link
                    href="/admin/settings"
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/25 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <Settings className="size-3.5" />
                    ตั้งค่าเว็บ
                  </Link>
                ) : null}
                <a
                  href={withBasePath("/api/admin/session/logout")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/25 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <LogOut className="size-3.5" />
                  ออกจากระบบ
                </a>
              </div>
            </div>
          </div>
        ) : null}
        <div className="border-b border-blue-100 bg-sky-50/80">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-muted-foreground md:px-6">
            <div className="flex flex-wrap items-center gap-4">
              <a className="flex items-center gap-1.5 hover:text-foreground" href={`mailto:${settings.contactEmail}`}>
                <Mail className="size-3.5" />
                {settings.contactEmail}
              </a>
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {settings.contactPhone}
              </span>
              <span className="hidden items-center gap-1.5 lg:flex">
                <MapPin className="size-3.5" />
                {settings.address}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link className="hover:text-foreground" href="/complaint">
                ร้องเรียน / เสนอแนะ
              </Link>
              <span>TH</span>
              <Link className="hover:text-foreground" href="#">
                EN
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-md border border-blue-100 bg-white shadow-sm">
              <Image
                src={withBasePath("/assets/images/logo-surin-polytechnic.png")}
                alt="ตราวิทยาลัยสารพัดช่างสุรินทร์"
                width={44}
                height={44}
                className="size-11 object-contain"
                priority
              />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-lg font-extrabold md:text-xl">
                {settings.collegeName}
              </strong>
              <span className="block truncate text-sm text-muted-foreground">
                {settings.collegeNameEn}
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/search">
                <Search data-icon="inline-start" />
                ค้นหา
              </Link>
            </Button>
            <Button asChild>
              <Link href="/ita">
                <ShieldCheck data-icon="inline-start" />
                ตรวจสอบ ITA
              </Link>
            </Button>
          </div>
        </div>

        <nav className="border-t border-blue-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 md:px-6">
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {navigation.map((item) => {
                const children = item.children ?? [];
                const isActive = active === item.itemKey || children.some((child) => active === child.itemKey);

                return (
                  <div key={item.itemKey} className="group relative">
                    <Link
                      href={item.href}
                      target={isExternalLink(item.href) ? "_blank" : undefined}
                      rel={isExternalLink(item.href) ? "noreferrer" : undefined}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-sky-100 hover:text-blue-900",
                        isActive && "bg-blue-700 text-white shadow-sm hover:bg-blue-800 hover:text-white"
                      )}
                    >
                      {item.label}
                      {children.length ? <ChevronDown className="size-3.5" /> : null}
                    </Link>
                    {children.length ? (
                      <div className="invisible absolute left-0 top-full z-40 min-w-72 translate-y-2 rounded-md border border-blue-100 bg-white p-2 opacity-0 shadow-xl shadow-blue-950/10 transition-all group-focus-within:visible group-focus-within:translate-y-1 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                        <div className="flex flex-col gap-1">
                          {children.map((child) => (
                            <Link
                              key={child.itemKey}
                              href={child.href}
                              target={isExternalLink(child.href) ? "_blank" : undefined}
                              rel={isExternalLink(child.href) ? "noreferrer" : undefined}
                              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-800"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <AdminInlineTools
              user={signedInAdminUser}
              permission="cms.navbar"
              module="navigation_items"
              label="แก้ไขเมนู"
              description="จัดการเมนูหลัก เมนูย่อย และลิงก์ที่เชื่อมไปยังหน้าเนื้อหาของเว็บไซต์"
              showCreate={false}
              className="shrink-0"
            />
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.5fr_1fr_1fr] md:px-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Image
                src={withBasePath("/assets/images/logo-surin-polytechnic.png")}
                alt="ตราวิทยาลัยสารพัดช่างสุรินทร์"
                width={40}
                height={40}
                className="size-10 object-contain"
              />
              <div>
                <strong>{settings.collegeName}</strong>
                <p className="text-sm text-muted-foreground">{settings.collegeNameEn}</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">{settings.address}</p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <strong>เมนูหลัก</strong>
            <Link href="/services" className="text-muted-foreground hover:text-foreground">
              บริการออนไลน์
            </Link>
            <Link href="/documents" className="text-muted-foreground hover:text-foreground">
              ดาวน์โหลดเอกสาร
            </Link>
            <Link href="/complaint" className="text-muted-foreground hover:text-foreground">
              ร้องเรียน / ข้อเสนอแนะ
            </Link>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <strong>ข้อมูลสาธารณะ</strong>
            <Link href="/ita" className="text-muted-foreground hover:text-foreground">
              ITA / OIT
            </Link>
            <Link href="/procurement" className="text-muted-foreground hover:text-foreground">
              จัดซื้อจัดจ้าง
            </Link>
            <Link href="/plans" className="text-muted-foreground hover:text-foreground">
              แผนและรายงาน
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
