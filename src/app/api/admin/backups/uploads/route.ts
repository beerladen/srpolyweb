import { Readable } from "stream";
import { NextResponse } from "next/server";
import { backupTimestamp, uploadsArchiveStream } from "@/lib/backup";
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
    return { error: NextResponse.json({ message: "ไม่มีสิทธิ์สำรองไฟล์อัปโหลด" }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const { error } = await requireBackupUser();

  if (error) {
    return error;
  }

  const archive = await uploadsArchiveStream().catch(() => null);

  if (!archive) {
    return NextResponse.json({ message: "ยังไม่พบโฟลเดอร์ไฟล์อัปโหลด" }, { status: 404 });
  }

  const filename = `srpoly-uploads-${backupTimestamp()}.tar.gz`;

  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/gzip",
    },
  });
}
