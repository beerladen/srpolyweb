import { NextResponse } from "next/server";
import { backupDatabaseName, backupTimestamp, createDatabaseBackupSql } from "@/lib/backup";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { canAccess } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireBackupUser() {
  const user = await getSignedInAdminUser();

  if (!user) {
    return { error: NextResponse.json({ message: "กรุณาเข้าสู่ระบบใหม่" }, { status: 401 }) };
  }

  if (!canAccess(user.effectivePermissions, "users")) {
    return { error: NextResponse.json({ message: "ไม่มีสิทธิ์สำรองข้อมูลระบบ" }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const { user, error } = await requireBackupUser();

  if (error) {
    return error;
  }

  const sql = await createDatabaseBackupSql(user.email);
  const filename = `srpoly-${backupDatabaseName()}-${backupTimestamp()}.sql`;

  return new Response(sql, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/sql; charset=utf-8",
    },
  });
}
