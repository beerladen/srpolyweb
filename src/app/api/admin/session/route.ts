import { NextResponse } from "next/server";
import {
  adminCookiePath,
  adminSessionCookieName,
  authenticateAdmin,
  deprecatedAdminSessionCookieName,
  legacyAdminCookieName,
} from "@/lib/admin-auth";

const cleanupCookiePaths = Array.from(new Set([adminCookiePath, "/"]));

function expireCookie(response: NextResponse, name: string) {
  for (const path of cleanupCookiePaths) {
    response.headers.append("Set-Cookie", `${name}=; Path=${path}; Max-Age=0; SameSite=Lax`);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; identifier?: string; password?: string };
  const identifier = body.identifier ?? body.email ?? "";
  const password = body.password ?? "";
  const user = await authenticateAdmin(identifier, password);

  if (!identifier || !password) {
    return NextResponse.json({ ok: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, { status: 400 });
  }

  if (!user) {
    return NextResponse.json({ ok: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: { name: user.name, email: user.email } });
  response.cookies.set(adminSessionCookieName, user.email.toLowerCase(), {
    path: adminCookiePath,
    httpOnly: true,
    sameSite: "lax",
  });
  if (adminCookiePath !== "/") {
    response.headers.append("Set-Cookie", `${adminSessionCookieName}=; Path=/; Max-Age=0; SameSite=Lax`);
  }
  expireCookie(response, deprecatedAdminSessionCookieName);
  expireCookie(response, legacyAdminCookieName);

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  expireCookie(response, adminSessionCookieName);
  expireCookie(response, deprecatedAdminSessionCookieName);
  expireCookie(response, legacyAdminCookieName);

  return response;
}
