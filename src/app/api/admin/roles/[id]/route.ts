import { NextResponse } from "next/server";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { deleteManagedAdminRole, updateManagedAdminRole } from "@/lib/admin-user-management";
import { canAccess } from "@/lib/permissions";

async function requireUsersAccess() {
  const user = await getSignedInAdminUser();

  if (!user) {
    return { error: NextResponse.json({ message: "กรุณาเข้าสู่ระบบใหม่" }, { status: 401 }) };
  }

  if (!canAccess(user.effectivePermissions, "users")) {
    return { error: NextResponse.json({ message: "ไม่มีสิทธิ์จัดการบทบาท" }, { status: 403 }) };
  }

  return { user };
}

async function readId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const roleId = Number(id);

  return Number.isInteger(roleId) && roleId > 0 ? roleId : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const roleId = await readId(params);

  if (!roleId) {
    return NextResponse.json({ message: "ไม่พบบทบาท" }, { status: 400 });
  }

  const access = await requireUsersAccess();

  if (access.error) {
    return access.error;
  }

  const payload = await request.json().catch(() => null);
  const result = await updateManagedAdminRole(roleId, payload ?? {}, access.user);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, item: result.item });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const roleId = await readId(params);

  if (!roleId) {
    return NextResponse.json({ message: "ไม่พบบทบาท" }, { status: 400 });
  }

  const access = await requireUsersAccess();

  if (access.error) {
    return access.error;
  }

  const result = await deleteManagedAdminRole(roleId, access.user);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
