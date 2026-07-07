import { NextResponse } from "next/server";
import { createPasswordResetRequest } from "@/lib/admin-user-management";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const result = await createPasswordResetRequest(payload ?? {});

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
