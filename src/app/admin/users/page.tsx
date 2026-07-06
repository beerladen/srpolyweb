import { AdminLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminRoles, getAdminUsers, getCurrentAdminUser } from "@/lib/admin-auth";
import {
  canAccess,
  permissionCatalogKeys,
  permissionDescription,
  permissionLabel,
} from "@/lib/permissions";
import { statusLabel, statusVariant } from "@/lib/site-data";

export default async function UsersPage() {
  const [users, roles, currentUser] = await Promise.all([
    getAdminUsers(),
    getAdminRoles(),
    getCurrentAdminUser(),
  ]);

  if (!canAccess(currentUser.effectivePermissions, "users")) {
    return (
      <AdminLayout title="ผู้ใช้งาน / สิทธิ์">
        <Card>
          <CardHeader>
            <CardTitle>ไม่มีสิทธิ์จัดการผู้ใช้งาน</CardTitle>
            <CardDescription>
              บัญชี {currentUser.email} เห็นเฉพาะเมนูที่ได้รับมอบหมายจากบทบาท {currentUser.roleName}
            </CardDescription>
          </CardHeader>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ผู้ใช้งาน / สิทธิ์">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-normal">ผู้ใช้งานและบทบาท</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            อ่านจากตาราง users และ roles เดิม โดยรวมสิทธิ์จากบทบาทหลักกับสิทธิ์เฉพาะผู้ใช้ แล้วนำไปกรองเมนูหลังบ้าน
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card>
            <CardHeader>
              <CardTitle>บัญชีผู้ใช้งาน</CardTitle>
              <CardDescription>เมนูหลังบ้านของแต่ละบัญชีจะยึดจากสิทธิ์ที่มีผลจริง</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>บทบาท</TableHead>
                    <TableHead>หน่วยงาน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>สิทธิ์ที่เห็นในเมนู</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.roleName}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(user.status)}>{statusLabel(user.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-md flex-wrap gap-1.5">
                          {user.effectivePermissions.map((permission) => (
                            <Badge key={permission} variant={permission === "*" ? "default" : "secondary"}>
                              {permissionLabel(permission)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>บทบาทจากระบบเดิม</CardTitle>
              <CardDescription>ใช้เป็นชุดสิทธิ์ตั้งต้น ก่อนรวมสิทธิ์เฉพาะรายบัญชี</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {roles.map((role) => (
                <div key={role.id} className="rounded-md border p-3">
                  <div className="font-medium">{role.roleName}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {role.permissions.map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permissionLabel(permission)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการสิทธิ์ที่ระบบรองรับ</CardTitle>
            <CardDescription>ชุดเดียวกับที่ระบบ PHP เดิมใช้ใน require_permission(...)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {permissionCatalogKeys().map((permission) => (
              <div key={permission} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{permissionLabel(permission)}</div>
                  <Badge variant="secondary">{permission}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {permissionDescription(permission)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
