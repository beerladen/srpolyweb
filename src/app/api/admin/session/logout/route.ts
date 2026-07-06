import { NextResponse } from "next/server";
import {
  adminCookiePath,
  adminSessionCookieName,
  deprecatedAdminSessionCookieName,
  legacyAdminCookieName,
} from "@/lib/admin-auth";

const cleanupCookiePaths = Array.from(new Set([adminCookiePath, "/"]));

function expireCookie(response: NextResponse, name: string) {
  for (const path of cleanupCookiePaths) {
    response.headers.append("Set-Cookie", `${name}=; Path=${path}; Max-Age=0; SameSite=Lax`);
  }
}

export function GET() {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  const response = new NextResponse(null, {
    status: 307,
    headers: {
      Location: `${basePath}/signin`,
    },
  });
  expireCookie(response, adminSessionCookieName);
  expireCookie(response, deprecatedAdminSessionCookieName);
  expireCookie(response, legacyAdminCookieName);

  return response;
}
