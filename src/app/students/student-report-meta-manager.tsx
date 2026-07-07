"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showAppToast } from "@/components/ui/app-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiPath } from "@/lib/base-path";

export type StudentReportMetaRow = {
  id: number;
  academicYear: string;
  reportDate: string | null;
};

type StudentReportMetaManagerProps = {
  rows: StudentReportMetaRow[];
  academicYear: string;
  reportDate: string;
};

export function StudentReportMetaManager({ rows, academicYear, reportDate }: StudentReportMetaManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draftYear, setDraftYear] = useState(academicYear);
  const [draftDate, setDraftDate] = useState(reportDate);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveMeta() {
    if (!rows.length) {
      const errorMessage = "ยังไม่มีแถวข้อมูลสำหรับปีการศึกษานี้";
      setMessage(errorMessage);
      showAppToast({ type: "error", title: "บันทึกไม่สำเร็จ", message: errorMessage });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      for (const row of rows) {
        const response = await fetch(apiPath(`/api/admin/modules/student_enrollments/items/${row.id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            academic_year: draftYear || row.academicYear,
            report_date: draftDate || null,
          }),
        });

        if (!response.ok) {
          const result = (await response.json().catch(() => null)) as { message?: string } | null;
          const errorMessage = result?.message ?? "ยังบันทึกรายละเอียดหัวรายงานไม่ได้";
          setMessage(errorMessage);
          showAppToast({ type: "error", title: "บันทึกไม่สำเร็จ", message: errorMessage });
          setSaving(false);
          return;
        }
      }

      const successMessage = `บันทึกรายละเอียดหัวรายงาน ${rows.length.toLocaleString("th-TH")} แถวแล้ว`;
      setMessage(successMessage);
      setOpen(false);
      showAppToast({ type: "success", title: "อัปเดตหัวรายงานสำเร็จ", message: successMessage });
      router.refresh();
    } catch {
      const errorMessage = "ยังบันทึกไม่ได้ โปรดลองอีกครั้ง";
      setMessage(errorMessage);
      showAppToast({ type: "error", title: "บันทึกไม่สำเร็จ", message: errorMessage });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary" className="h-7 rounded-full bg-white/15 px-3 text-xs text-white hover:bg-white/25">
          <CalendarDays className="size-3.5" />
          แก้ไขหัวรายงาน
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>แก้ไขรายละเอียดหัวรายงาน</DialogTitle>
          <DialogDescription>
            ใช้สำหรับแก้ปีการศึกษาและ “ข้อมูล ณ วันที่” ของรายงานปีนี้ โดยระบบจะอัปเดตให้ทุกแถวที่เกี่ยวข้องพร้อมกัน
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-slate-500" htmlFor="student-report-year">
              ปีการศึกษา
            </label>
            <Input id="student-report-year" value={draftYear} onChange={(event) => setDraftYear(event.target.value)} placeholder="2569" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500" htmlFor="student-report-date">
              ข้อมูล ณ วันที่
            </label>
            <Input id="student-report-date" type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} />
          </div>
        </div>

        <div className="rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs leading-5 text-slate-600">
          จะอัปเดตข้อมูล {rows.length.toLocaleString("th-TH")} แถวในปีการศึกษานี้ เพื่อให้วันที่บนหัวรายงานตรงกันทั้งหน้า
        </div>
        {message ? <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">{message}</div> : null}

        <DialogFooter>
          <Button type="button" onClick={() => void saveMeta()} disabled={saving || !rows.length}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
