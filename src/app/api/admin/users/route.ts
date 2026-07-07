import { NextResponse } from "next/server";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { createManagedAdminUser, getManagedAdminUsers } from "@/lib/admin-user-management";
import { canAccess } from "@/lib/permissions";

async function requireUsersAccess() {
  const user = await getSignedInAdminUser();

  if (!user) {
    return { error: NextResponse.json({ message: "กรุณาเข้าสู่ระบบใหม่" }, { status: 401 }) };
  }

  if (!canAccess(user.effectivePermissions, "users")) {
    return { error: NextResponse.json({ message: "ไม่มีสิทธิ์จัดการผู้ใช้งาน" }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const access = await requireUsersAccess();

  if (access.error) {
    return access.error;
  }

  return NextResponse.json({ ok: true, items: await getManagedAdminUsers() });
}

export async function POST(request: Request) {
  const access = await requireUsersAccess();

  if (access.error) {
    return access.error;
  }

  const payload = await request.json().catch(() => null);
  const result = await createManagedAdminUser(payload ?? {}, access.user);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, item: result.item });
}
