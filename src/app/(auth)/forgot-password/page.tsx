"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle, KeyRound, Loader2 } from "lucide-react";
import { AuthLogo } from "@/components/auth/auth-logo";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiPath } from "@/lib/base-path";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch(apiPath("/api/password-reset-requests"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, note }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(result?.message ?? "ยังส่งคำขอรีเซ็ตรหัสผ่านไม่ได้");
      setIsLoading(false);
      return;
    }

    setIsSubmitted(true);
    setIsLoading(false);
  }

  if (isSubmitted) {
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

        <section className="rounded-md border border-emerald-100 bg-white p-6 text-center shadow-sm shadow-emerald-950/5">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle className="size-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-normal text-slate-950">ส่งคำขอรีเซ็ตแล้ว</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            ระบบบันทึกคำขอของ <span className="font-semibold text-slate-950">{identifier}</span> แล้ว
            กรุณาติดต่อผู้ดูแลระบบเพื่อรับรหัสผ่านใหม่หลังจากตรวจสอบบัญชี
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={() => setIsSubmitted(false)}>
              ส่งคำขออีกบัญชี
            </Button>
            <Button asChild>
              <Link href="/signin">กลับไปเข้าสู่ระบบ</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

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

      <section className="rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-950/5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white">
            <KeyRound className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-blue-700">Password Support</p>
            <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950">ลืมรหัสผ่าน</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ส่งคำขอให้ผู้ดูแลระบบตรวจสอบและออก/ตั้งรหัสผ่านใหม่ให้บัญชีของคุณ
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
                placeholder="เช่น srpoly หรือ user@srpoly.ac.th"
              />
              <FieldDescription>ระบบจะจับคู่กับบัญชีที่มีอยู่ และส่งคำขอไปยังเมนูผู้ใช้งาน/สิทธิ์</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="note">หมายเหตุถึงผู้ดูแล</FieldLabel>
              <Textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-24 bg-white"
                placeholder="เช่น ขอรีเซ็ตรหัสผ่านบัญชีฝ่ายงาน..."
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
                กำลังส่งคำขอ
              </>
            ) : (
              "ส่งคำขอรีเซ็ตรหัสผ่าน"
            )}
          </Button>
        </form>
      </section>

      <p className="text-center text-sm text-slate-500">
        จำรหัสผ่านได้แล้ว?{" "}
        <Link href="/signin" className="font-semibold text-blue-700 hover:text-blue-900">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
