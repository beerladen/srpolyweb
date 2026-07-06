import { NextResponse } from "next/server";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import {
  deleteAdminCrudItem,
  findAdminCrudDuplicate,
  getAdminCrudAvailableConfig,
  getAdminCrudRawRow,
  getAdminCrudRow,
  normalizeAdminCrudPayload,
  updateAdminCrudItem,
} from "@/lib/admin-crud-server";
import { canAccess } from "@/lib/permissions";

async function requireModuleAccess(moduleKey: string) {
  const [user, config] = await Promise.all([
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig(moduleKey),
  ]);

  if (!config) {
    return { error: NextResponse.json({ message: "ไม่พบเมนูจัดการนี้" }, { status: 404 }) };
  }

  if (!user) {
    return { error: NextResponse.json({ message: "กรุณาเข้าสู่ระบบใหม่" }, { status: 401 }) };
  }

  if (!canAccess(user.effectivePermissions, config.permission)) {
    return { error: NextResponse.json({ message: `ไม่มีสิทธิ์จัดการ${config.label}` }, { status: 403 }) };
  }

  return { user, config };
}

async function readParams(params: Promise<{ module: string; id: string }>) {
  const { module: moduleKey, id } = await params;
  const itemId = Number(id);

  return {
    moduleKey,
    itemId: Number.isInteger(itemId) && itemId > 0 ? itemId : null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ module: string; id: string }> }
) {
  const { moduleKey, itemId } = await readParams(params);

  if (!itemId) {
    return NextResponse.json({ message: "ไม่พบรายการ" }, { status: 400 });
  }

  const access = await requireModuleAccess(moduleKey);

  if (access.error) {
    return access.error;
  }

  const item = await getAdminCrudRow(access.config, itemId);

  if (!item) {
    return NextResponse.json({ message: "ไม่พบรายการ" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ module: string; id: string }> }
) {
  const { moduleKey, itemId } = await readParams(params);

  if (!itemId) {
    return NextResponse.json({ message: "ไม่พบรายการ" }, { status: 400 });
  }

  const access = await requireModuleAccess(moduleKey);

  if (access.error) {
    return access.error;
  }

  const existing = await getAdminCrudRawRow(access.config, itemId);

  if (!existing) {
    return NextResponse.json({ message: "ไม่พบรายการ" }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  const normalized = normalizeAdminCrudPayload(access.config, payload, existing);

  if (!normalized.ok) {
    return NextResponse.json({ message: normalized.message }, { status: 400 });
  }

  const duplicateField = await findAdminCrudDuplicate(access.config, normalized.values, itemId);

  if (duplicateField) {
    return NextResponse.json({ message: `${duplicateField}นี้ถูกใช้แล้ว` }, { status: 409 });
  }

  const saved = await updateAdminCrudItem(access.config, itemId, normalized.values);

  if (!saved) {
    return NextResponse.json({ message: "ยังบันทึกข้อมูลไม่ได้" }, { status: 503 });
  }

  if (saved.affectedRows === 0) {
    return NextResponse.json({ message: "ไม่พบรายการ" }, { status: 404 });
  }

  const item = await getAdminCrudRow(access.config, itemId);

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ module: string; id: string }> }
) {
  const { moduleKey, itemId } = await readParams(params);

  if (!itemId) {
    return NextResponse.json({ message: "ไม่พบรายการ" }, { status: 400 });
  }

  const access = await requireModuleAccess(moduleKey);

  if (access.error) {
    return access.error;
  }

  const deleted = await deleteAdminCrudItem(access.config, itemId);

  if (!deleted) {
    return NextResponse.json({ message: "ยังลบรายการไม่ได้" }, { status: 503 });
  }

  if (deleted.affectedRows === 0) {
    return NextResponse.json({ message: "ไม่พบรายการ" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
