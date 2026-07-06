"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { AuthLogo } from "@/components/auth/auth-logo";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiPath, withBasePath } from "@/lib/base-path";

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("srpoly");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch(apiPath("/api/admin/session"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(result?.message ?? "ยังเข้าสู่ระบบไม่ได้");
      setIsLoading(false);
      return;
    }

    window.location.assign(withBasePath("/admin"));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <AuthLogo />
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            กลับหน้าแรก
          </Link>
        </Button>
      </div>

      <div className="rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white">
            <LockKeyhole className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-blue-700">SRPOLY Admin</p>
            <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950">เข้าสู่ระบบหลังบ้าน</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              จัดการข่าว เนื้อหา เอกสารบริการ และข้อมูล OIT ตามสิทธิ์ของแต่ละบัญชี
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="identifier">ชื่อผู้ใช้หรืออีเมล</FieldLabel>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                autoComplete="username"
                className="h-11 bg-white"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">รหัสผ่าน</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="h-11 bg-white"
              />
            </Field>
          </FieldGroup>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                กำลังเข้าสู่ระบบ
              </>
            ) : (
              <>
                เข้าสู่ระบบ
                <ArrowRight data-icon="inline-end" />
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-md border border-cyan-100 bg-cyan-50/70 p-3 text-cyan-950">
          <ShieldCheck className="mb-2 size-4 text-cyan-700" />
          แสดงเมนูตามบทบาทผู้ใช้
        </div>
        <div className="rounded-md border border-amber-100 bg-amber-50/80 p-3 text-amber-950">
          ออกจากระบบแล้วต้องเข้าสู่ระบบใหม่
        </div>
      </div>
    </div>
  );
}
