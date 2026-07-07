import { AdminLayout } from "@/components/layout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { getManagedAdminRoles, getManagedAdminUsers } from "@/lib/admin-user-management";
import { canAccess } from "@/lib/permissions";
import { AdminUsersManager } from "@/app/admin/users/admin-users-manager";

export default async function UsersPage() {
  const currentUser = await getCurrentAdminUser();

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

  const [users, roles] = await Promise.all([
    getManagedAdminUsers(),
    getManagedAdminRoles(),
  ]);

  return (
    <AdminLayout title="ผู้ใช้งาน / สิทธิ์">
      <AdminUsersManager users={users} roles={roles} currentUser={currentUser} />
    </AdminLayout>
  );
}
