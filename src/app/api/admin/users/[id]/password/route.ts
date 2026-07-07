import { NextResponse } from "next/server";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { resetManagedAdminUserPassword } from "@/lib/admin-user-management";
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

async function readId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const userId = Number(id);

  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await readId(params);

  if (!userId) {
    return NextResponse.json({ message: "ไม่พบบัญชีผู้ใช้" }, { status: 400 });
  }

  const access = await requireUsersAccess();

  if (access.error) {
    return access.error;
  }

  const payload = await request.json().catch(() => null);
  const result = await resetManagedAdminUserPassword(userId, payload ?? {}, access.user);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, item: result.item });
}
