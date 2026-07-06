import { NextResponse } from "next/server";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import {
  createAdminCrudItem,
  findAdminCrudDuplicate,
  getAdminCrudAvailableConfig,
  getAdminCrudRow,
  getAdminCrudRows,
  normalizeAdminCrudPayload,
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ module: string }> }
) {
  const { module: moduleKey } = await params;
  const access = await requireModuleAccess(moduleKey);

  if (access.error) {
    return access.error;
  }

  const rows = await getAdminCrudRows(access.config);

  if (!rows) {
    return NextResponse.json({ message: "ยังอ่านข้อมูลไม่ได้" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, items: rows });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ module: string }> }
) {
  const { module: moduleKey } = await params;
  const access = await requireModuleAccess(moduleKey);

  if (access.error) {
    return access.error;
  }

  const payload = await request.json().catch(() => null);
  const normalized = normalizeAdminCrudPayload(access.config, payload);

  if (!normalized.ok) {
    return NextResponse.json({ message: normalized.message }, { status: 400 });
  }

  const duplicateField = await findAdminCrudDuplicate(access.config, normalized.values);

  if (duplicateField) {
    return NextResponse.json({ message: `${duplicateField}นี้ถูกใช้แล้ว` }, { status: 409 });
  }

  const created = await createAdminCrudItem(access.config, normalized.values);

  if (!created) {
    return NextResponse.json({ message: "ยังสร้างรายการไม่ได้" }, { status: 503 });
  }

  const item = await getAdminCrudRow(access.config, created.insertId);

  return NextResponse.json({ ok: true, item });
}
