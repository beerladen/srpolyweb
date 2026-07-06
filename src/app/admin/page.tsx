import Link from "next/link";
import { ArrowRight, FileText, Landmark, Newspaper, ShieldCheck } from "lucide-react";
import { AdminLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { canAccess } from "@/lib/permissions";
import { adminModules, getSiteOverview, statusLabel, statusVariant } from "@/lib/site-data";

export default async function AdminDashboardPage() {
  const [overview, currentUser] = await Promise.all([getSiteOverview(), getCurrentAdminUser()]);
  const visibleModules = adminModules.filter((module) => canAccess(currentUser.effectivePermissions, module.permission));
  const itaReady = overview.ita.filter((item) => item.status === "published").length;
  const recentItems = [
    ...(canAccess(currentUser.effectivePermissions, "news") ? overview.news.slice(0, 2) : []),
    ...(canAccess(currentUser.effectivePermissions, "documents") ? overview.documents.slice(0, 2) : []),
    ...(canAccess(currentUser.effectivePermissions, "procurement") ? overview.procurement.slice(0, 2) : []),
  ];

  const stats = [
    { title: "ข่าวเผยแพร่", value: overview.news.length, icon: Newspaper, href: "/admin/modules/news", permission: "news" },
    { title: "เอกสาร", value: overview.documents.length, icon: FileText, href: "/admin/modules/documents", permission: "documents" },
    { title: "พัสดุ", value: overview.procurement.length, icon: Landmark, href: "/admin/modules/procurement", permission: "procurement" },
    { title: "ITA พร้อมเผยแพร่", value: `${itaReady}/${overview.ita.length}`, icon: ShieldCheck, href: "/admin/modules/ita", permission: "ita" },
  ].filter((stat) => canAccess(currentUser.effectivePermissions, stat.permission));

  return (
    <AdminLayout title="Dashboard">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-normal">ภาพรวมระบบเว็บไซต์</h2>
          <p className="text-sm text-muted-foreground">
            เข้าสู่ระบบในบทบาท {currentUser.roleName} จาก {currentUser.department} ระบบจะแสดงเฉพาะเมนูที่บัญชีนี้จัดการได้
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={stat.href}>
                      จัดการ
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {stats.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-4">
              <CardHeader>
                <CardTitle>ยังไม่มีโมดูลที่เปิดให้บัญชีนี้จัดการ</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                โปรดให้ผู้ดูแลระบบกำหนดสิทธิ์เพิ่มเติมในเมนูผู้ใช้งาน / สิทธิ์
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>รายการล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อรายการ</TableHead>
                    <TableHead>หมวด</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">ลิงก์</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentItems.map((item) => (
                    <TableRow key={`${item.href}-${item.id}`}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.category ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={item.href} target="_blank">ดู</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>โมดูลที่ย้ายจากระบบเดิม</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {visibleModules.slice(0, 8).map((module) => (
                <Link
                  key={module.key}
                  href={`/admin/modules/${module.key}`}
                  className="rounded-md border p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="block font-semibold">{module.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{module.table}</span>
                </Link>
              ))}
              {visibleModules.length === 0 && (
                <p className="text-sm leading-6 text-muted-foreground">
                  บัญชีนี้ยังไม่ได้รับสิทธิ์จัดการโมดูลใด
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
