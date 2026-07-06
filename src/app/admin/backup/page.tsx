import { DatabaseBackup, Download, FolderArchive, ShieldCheck } from "lucide-react";
import { AdminLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { withBasePath } from "@/lib/base-path";
import { canAccess } from "@/lib/permissions";

export default async function BackupPage() {
  const currentUser = await getCurrentAdminUser();
  const canBackup = canAccess(currentUser.effectivePermissions, "users");

  return (
    <AdminLayout title="สำรองข้อมูล">
      <div className="flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-primary">Backup Center</p>
          <h2 className="text-2xl font-bold tracking-normal">สำรองข้อมูลระบบเว็บไซต์</h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            ดาวน์โหลดข้อมูลสำคัญของระบบเพื่อเก็บไว้ในเครื่องผู้ดูแล แนะนำให้สำรองหลังมีการอัปเดตข้อมูลจำนวนมากหรือก่อนปรับระบบใหญ่
          </p>
        </div>

        {!canBackup ? (
          <Card>
            <CardHeader>
              <CardTitle>ไม่มีสิทธิ์ใช้งาน Backup Center</CardTitle>
              <CardDescription>เมนูนี้จำกัดเฉพาะผู้ดูแลที่มีสิทธิ์จัดการผู้ใช้และระบบเท่านั้น</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              บัญชี {currentUser.email} อยู่ในบทบาท {currentUser.roleName} จึงยังไม่สามารถดาวน์โหลดไฟล์สำรองข้อมูลได้
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <DatabaseBackup className="size-5" />
                    </span>
                    <div>
                      <CardTitle>ฐานข้อมูลเว็บไซต์</CardTitle>
                      <CardDescription className="mt-1">
                        ข่าว เมนู ผู้ใช้ สิทธิ์ เนื้อหา เอกสาร บริการออนไลน์ และข้อมูลตั้งค่าทั้งหมดในฐานข้อมูล
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
                    ระบบจะสร้างไฟล์ SQL แบบดาวน์โหลดทันที ไฟล์นี้ใช้กู้คืนฐานข้อมูลได้ในกรณีฉุกเฉิน
                  </div>
                  <Button asChild className="w-fit">
                    <a href={withBasePath("/api/admin/backups/database")}>
                      <Download data-icon="inline-start" />
                      ดาวน์โหลดฐานข้อมูล
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <FolderArchive className="size-5" />
                    </span>
                    <div>
                      <CardTitle>ไฟล์อัปโหลด</CardTitle>
                      <CardDescription className="mt-1">
                        รูปภาพผู้บริหาร ภาพข่าว เอกสาร PDF ไฟล์แนบ และไฟล์บริการดาวน์โหลดที่อยู่ในโฟลเดอร์ uploads
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
                    ระบบจะบีบอัดไฟล์เป็น .tar.gz แล้วส่งให้ดาวน์โหลด โดยไม่เก็บไฟล์สำรองค้างไว้บนเซิร์ฟเวอร์
                  </div>
                  <Button asChild variant="outline" className="w-fit">
                    <a href={withBasePath("/api/admin/backups/uploads")}>
                      <Download data-icon="inline-start" />
                      ดาวน์โหลดไฟล์อัปโหลด
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <CardTitle>ข้อควรระวัง</CardTitle>
                    <CardDescription className="mt-1">ไฟล์สำรองข้อมูลมีข้อมูลสำคัญของเว็บไซต์และบัญชีผู้ใช้</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-3">
                <div className="rounded-md border bg-card px-4 py-3">เก็บไฟล์ไว้ในเครื่องหรือพื้นที่จัดเก็บที่มีรหัสผ่าน</div>
                <div className="rounded-md border bg-card px-4 py-3">ไม่ส่งไฟล์สำรองผ่านช่องทางสาธารณะหรือแชตกลุ่ม</div>
                <div className="rounded-md border bg-card px-4 py-3">สำรองฐานข้อมูลและไฟล์อัปโหลดคู่กันเพื่อกู้คืนเว็บได้ครบ</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
