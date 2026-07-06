"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiPath, withBasePath } from "@/lib/base-path";

export type StudentEnrollmentManagerRow = {
  id: number;
  academicYear: string;
  reportDate: string | null;
  levelLabel: string;
  departmentName: string;
  studentCount: number;
  actualCount: number | null;
  registeredCount: number | null;
  maleCount: number | null;
  femaleCount: number | null;
  note: string | null;
  sortOrder: number;
};

type StudentEnrollmentManagerProps = {
  academicYear: string;
  department: string;
  rows: StudentEnrollmentManagerRow[];
  compact?: boolean;
};

type DraftRow = {
  localKey: string;
  id: number | null;
  academicYear: string;
  reportDate: string;
  levelLabel: string;
  departmentName: string;
  studentCount: string;
  actualCount: string;
  registeredCount: string;
  maleCount: string;
  femaleCount: string;
  note: string;
  sortOrder: string;
};

const levelOptions = [
  { value: "ปวช.1", label: "ปวช.1" },
  { value: "ปวช.2", label: "ปวช.2" },
  { value: "ปวช.3", label: "ปวช.3" },
  { value: "ปวส.ทวิ ปี 1", label: "ปวส.ทวิ ปี 1" },
  { value: "ปวส.ทวิ ปี 2", label: "ปวส.ทวิ ปี 2" },
  { value: "ปวส.ภาคสมทบ ปี 1", label: "ปวส.ภาคสมทบ ปี 1" },
  { value: "ปวส.ภาคสมทบ ปี 2", label: "ปวส.ภาคสมทบ ปี 2" },
] as const;

type LevelOptionValue = (typeof levelOptions)[number]["value"];
type BucketKey = "p1" | "p2" | "p3" | "pvsDualYear1" | "pvsDualYear2" | "pvsAssociateYear1" | "pvsAssociateYear2";

const bucketByLevel: Record<LevelOptionValue, BucketKey> = {
  "ปวช.1": "p1",
  "ปวช.2": "p2",
  "ปวช.3": "p3",
  "ปวส.ทวิ ปี 1": "pvsDualYear1",
  "ปวส.ทวิ ปี 2": "pvsDualYear2",
  "ปวส.ภาคสมทบ ปี 1": "pvsAssociateYear1",
  "ปวส.ภาคสมทบ ปี 2": "pvsAssociateYear2",
};

const sortByLevel: Record<LevelOptionValue, number> = {
  "ปวช.1": 11,
  "ปวช.2": 21,
  "ปวช.3": 31,
  "ปวส.ทวิ ปี 1": 51,
  "ปวส.ทวิ ปี 2": 52,
  "ปวส.ภาคสมทบ ปี 1": 61,
  "ปวส.ภาคสมทบ ปี 2": 62,
};

type SavedStudentEnrollmentResponse = {
  message?: string;
  item?: {
    id: number;
  };
};

function textValue(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function numericValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function toThaiNumber(value: number): string {
  return value.toLocaleString("th-TH");
}

function normalizeForCompare(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

function canonicalLevelLabel(levelLabel: string, departmentName = ""): LevelOptionValue {
  const compact = normalizeForCompare(`${levelLabel} ${departmentName}`);
  const exactOption = levelOptions.find((option) => option.value === levelLabel);
  const isAssociate = compact.includes("สมทบ") || compact.includes("ภาคสมทบ");
  const isSecondYear = compact.includes("ปี2") || compact.includes("ปีที่2") || compact.includes("ปวส.2") || compact.includes("ปวส2");

  if (compact.includes("ปวช.1")) return "ปวช.1";
  if (compact.includes("ปวช.2")) return "ปวช.2";
  if (compact.includes("ปวช.3")) return "ปวช.3";

  if (compact.includes("ปวส")) {
    if (isAssociate) return isSecondYear ? "ปวส.ภาคสมทบ ปี 2" : "ปวส.ภาคสมทบ ปี 1";
    return isSecondYear ? "ปวส.ทวิ ปี 2" : "ปวส.ทวิ ปี 1";
  }

  return exactOption?.value ?? "ปวช.1";
}

function sortForLevel(levelLabel: string, departmentName = ""): number {
  return sortByLevel[canonicalLevelLabel(levelLabel, departmentName)];
}

function bucketKey(levelLabel: string, departmentName: string): BucketKey {
  return bucketByLevel[canonicalLevelLabel(levelLabel, departmentName)];
}

function defaultDepartmentName(department: string, levelLabel: string): string {
  const level = canonicalLevelLabel(levelLabel);

  if (level.includes("ภาคสมทบ")) return `${department} ภาคสมทบ`;
  if (level.includes("ทวิ")) return `${department} ทวิ`;
  return department;
}

function draftFromRow(row: StudentEnrollmentManagerRow, index: number): DraftRow {
  const levelLabel = canonicalLevelLabel(row.levelLabel, row.departmentName);

  return {
    localKey: `row-${row.id || index}-${index}`,
    id: row.id > 0 ? row.id : null,
    academicYear: row.academicYear,
    reportDate: row.reportDate?.slice(0, 10) ?? "",
    levelLabel,
    departmentName: row.departmentName,
    studentCount: textValue(row.studentCount),
    actualCount: textValue(row.actualCount ?? row.studentCount),
    registeredCount: textValue(row.registeredCount ?? row.studentCount),
    maleCount: textValue(row.maleCount),
    femaleCount: textValue(row.femaleCount),
    note: row.note ?? "",
    sortOrder: textValue(row.sortOrder || sortForLevel(levelLabel, row.departmentName)),
  };
}

function newDraftRow(academicYear: string, department: string, levelLabel: string, reportDate = ""): DraftRow {
  const normalizedLevel = canonicalLevelLabel(levelLabel);

  return {
    localKey: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    id: null,
    academicYear,
    reportDate,
    levelLabel: normalizedLevel,
    departmentName: defaultDepartmentName(department, normalizedLevel),
    studentCount: "0",
    actualCount: "0",
    registeredCount: "0",
    maleCount: "",
    femaleCount: "",
    note: "",
    sortOrder: String(sortForLevel(levelLabel)),
  };
}

function redirectToSignIn() {
  window.location.assign(withBasePath("/signin"));
}

export function StudentEnrollmentManager({ academicYear, department, rows, compact = false }: StudentEnrollmentManagerProps) {
  const router = useRouter();
  const initialDrafts = useMemo(
    () =>
      rows
        .map(draftFromRow)
        .sort((left, right) => Number(left.sortOrder) - Number(right.sortOrder)),
    [rows]
  );
  const initialReportDate = useMemo(() => initialDrafts.find((draft) => draft.reportDate)?.reportDate ?? "", [initialDrafts]);
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftRow[]>(initialDrafts);
  const [bulkAcademicYear, setBulkAcademicYear] = useState(initialDrafts[0]?.academicYear ?? academicYear);
  const [bulkReportDate, setBulkReportDate] = useState(initialReportDate);
  const [message, setMessage] = useState<string | null>(null);
  const [workingKey, setWorkingKey] = useState<string | null>(null);

  const totals = useMemo(() => {
    const next = { p1: 0, p2: 0, p3: 0, pvsDualYear1: 0, pvsDualYear2: 0, pvsAssociateYear1: 0, pvsAssociateYear2: 0 };

    for (const draft of drafts) {
      const key = bucketKey(draft.levelLabel, draft.departmentName);
      next[key] += numericValue(draft.studentCount);
    }

    return next;
  }, [drafts]);

  const totalAll =
    totals.p1 +
    totals.p2 +
    totals.p3 +
    totals.pvsDualYear1 +
    totals.pvsDualYear2 +
    totals.pvsAssociateYear1 +
    totals.pvsAssociateYear2;
  const unsavedCount = drafts.filter((draft) => !draft.id).length;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setDrafts(initialDrafts);
      setBulkAcademicYear(initialDrafts[0]?.academicYear ?? academicYear);
      setBulkReportDate(initialReportDate);
      setMessage(null);
      setWorkingKey(null);
    }
  }

  function updateDraft(localKey: string, updates: Partial<DraftRow>) {
    setDrafts((current) =>
      current.map((draft) => (draft.localKey === localKey ? { ...draft, ...updates } : draft))
    );
  }

  function updateBulkAcademicYear(value: string) {
    setBulkAcademicYear(value);
    setDrafts((current) => current.map((draft) => ({ ...draft, academicYear: value })));
  }

  function updateBulkReportDate(value: string) {
    setBulkReportDate(value);
    setDrafts((current) => current.map((draft) => ({ ...draft, reportDate: value })));
  }

  function addRow(levelLabel = "ปวช.1") {
    setDrafts((current) => [...current, newDraftRow(bulkAcademicYear || academicYear, department, levelLabel, bulkReportDate)]);
  }

  function addMissingRows() {
    setDrafts((current) => {
      const existingKeys = new Set(current.map((draft) => bucketKey(draft.levelLabel, draft.departmentName)));
      const missingRows = levelOptions
        .filter((option) => !existingKeys.has(bucketByLevel[option.value]))
        .map((option) => newDraftRow(bulkAcademicYear || academicYear, department, option.value, bulkReportDate));

      return [...current, ...missingRows];
    });
  }

  function payloadFromDraft(draft: DraftRow) {
    const studentCount = numericValue(draft.studentCount);

    return {
      academic_year: draft.academicYear || academicYear,
      report_date: draft.reportDate || null,
      level_label: draft.levelLabel,
      department_name: draft.departmentName || department,
      student_count: studentCount,
      actual_count: draft.actualCount === "" ? studentCount : numericValue(draft.actualCount),
      registered_count: draft.registeredCount === "" ? studentCount : numericValue(draft.registeredCount),
      unregistered_count: 0,
      repeat_count: 0,
      credit_collect_count: 0,
      male_count: draft.maleCount === "" ? null : numericValue(draft.maleCount),
      female_count: draft.femaleCount === "" ? null : numericValue(draft.femaleCount),
      note: draft.note,
      sort_order: numericValue(draft.sortOrder || String(sortForLevel(draft.levelLabel))),
      status: "active",
    };
  }

  async function saveDraft(draft: DraftRow, options: { refresh?: boolean; quiet?: boolean } = {}) {
    const refreshAfterSave = options.refresh ?? true;
    setWorkingKey(draft.localKey);
    if (!options.quiet) {
      setMessage(null);
    }

    try {
      const response = await fetch(
        apiPath(draft.id ? `/api/admin/modules/student_enrollments/items/${draft.id}` : "/api/admin/modules/student_enrollments/items"),
        {
          method: draft.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadFromDraft(draft)),
        }
      );

      if (response.status === 401) {
        redirectToSignIn();
        return false;
      }

      const result = (await response.json().catch(() => null)) as SavedStudentEnrollmentResponse | null;

      if (!response.ok) {
        setMessage(result?.message ?? "ยังบันทึกข้อมูลไม่ได้");
        return false;
      }

      if (result?.item?.id) {
        setDrafts((current) =>
          current.map((row) => (row.localKey === draft.localKey ? { ...row, id: result.item?.id ?? row.id } : row))
        );
      }

      if (!options.quiet) {
        setMessage("บันทึกข้อมูลแล้ว");
      }
      if (refreshAfterSave) {
        router.refresh();
      }
      return true;
    } catch {
      setMessage("ยังบันทึกข้อมูลไม่ได้ โปรดลองอีกครั้ง");
      return false;
    } finally {
      setWorkingKey(null);
    }
  }

  async function saveAll() {
    let savedCount = 0;

    for (const draft of drafts) {
      const saved = await saveDraft(draft, { refresh: false, quiet: true });
      if (!saved) {
        return;
      }
      savedCount += 1;
    }

    setMessage(`บันทึกข้อมูลทั้งหมด ${savedCount.toLocaleString("th-TH")} แถวแล้ว`);
    router.refresh();
  }

  async function deleteDraft(draft: DraftRow) {
    if (!draft.id) {
      setDrafts((current) => current.filter((row) => row.localKey !== draft.localKey));
      return;
    }

    if (!window.confirm(`ลบข้อมูล ${draft.levelLabel} ${draft.departmentName} ใช่หรือไม่`)) {
      return;
    }

    setWorkingKey(draft.localKey);
    setMessage(null);

    const response = await fetch(apiPath(`/api/admin/modules/student_enrollments/items/${draft.id}`), {
      method: "DELETE",
    });

    if (response.status === 401) {
      redirectToSignIn();
      return;
    }

    const result = (await response.json().catch(() => null)) as { message?: string } | null;
    setWorkingKey(null);

    if (!response.ok) {
      setMessage(result?.message ?? "ยังลบข้อมูลไม่ได้");
      return;
    }

    setDrafts((current) => current.filter((row) => row.localKey !== draft.localKey));
    setMessage("ลบข้อมูลแล้ว");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="h-8">
          <Pencil data-icon="inline-start" />
          {compact ? "แก้" : "จัดการแถวนี้"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>จัดการจำนวนผู้เรียนรายแผนก</DialogTitle>
          <DialogDescription>
            ปีการศึกษา {academicYear} · {department} · แก้ไข เพิ่ม หรือลบแถวข้อมูลที่ใช้คำนวณตารางรายงานนี้
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-lg border border-blue-100 bg-white p-4 md:grid-cols-[160px_180px_1fr] md:items-end">
          <div>
            <label className="text-xs font-bold text-slate-500" htmlFor="student-manager-year">
              ปีการศึกษา
            </label>
            <Input
              id="student-manager-year"
              value={bulkAcademicYear}
              onChange={(event) => updateBulkAcademicYear(event.target.value)}
              placeholder="2569"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500" htmlFor="student-manager-report-date">
              วันที่รายงาน
            </label>
            <Input
              id="student-manager-report-date"
              type="date"
              value={bulkReportDate}
              onChange={(event) => updateBulkReportDate(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="default" size="sm" onClick={addMissingRows}>
                <Plus data-icon="inline-start" />
                เติมแถวมาตรฐานที่ขาด
              </Button>
              {unsavedCount ? (
                <span className="inline-flex h-9 items-center rounded-full bg-amber-50 px-3 text-xs font-bold text-amber-700">
                  {unsavedCount.toLocaleString("th-TH")} แถวยังไม่บันทึก
                </span>
              ) : (
                <span className="inline-flex h-9 items-center rounded-full bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
                  บันทึกในฐานข้อมูลแล้ว
                </span>
              )}
            </div>
            <p className="text-right text-xs leading-5 text-slate-500">
              ปรับปีหรือวันที่ตรงนี้จะอัปเดตทุกแถวใน modal นี้พร้อมกัน
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          {[
            ["ปวช.1", totals.p1],
            ["ปวช.2", totals.p2],
            ["ปวช.3", totals.p3],
            ["ทวิ ปี 1", totals.pvsDualYear1],
            ["ทวิ ปี 2", totals.pvsDualYear2],
            ["สมทบ ปี 1", totals.pvsAssociateYear1],
            ["สมทบ ปี 2", totals.pvsAssociateYear2],
            ["รวม", totalAll],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
              <div className="text-xs font-bold text-blue-700">{label}</div>
              <div className="mt-2 text-2xl font-bold text-slate-950">{toThaiNumber(Number(value))}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {levelOptions.map((option) => (
            <Button key={option.value} type="button" variant="secondary" size="sm" onClick={() => addRow(option.value)}>
              <Plus data-icon="inline-start" />
              เพิ่ม {option.label}
            </Button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-blue-100">
          <table className="w-full min-w-[1060px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold text-slate-600">
              <tr>
                <th className="px-3 py-3">ระดับ</th>
                <th className="px-3 py-3">แผนก / กลุ่มเรียน</th>
                <th className="px-3 py-3">จำนวนรวม</th>
                <th className="px-3 py-3">มีตัวตนจริง</th>
                <th className="px-3 py-3">ลงทะเบียนแล้ว</th>
                <th className="px-3 py-3">ชาย</th>
                <th className="px-3 py-3">หญิง</th>
                <th className="px-3 py-3">หมายเหตุ</th>
                <th className="px-3 py-3 text-right">ทำงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {drafts.map((draft) => {
                const isWorking = workingKey === draft.localKey;

                return (
                  <tr key={draft.localKey} className="align-top">
                    <td className="px-3 py-3">
                      <Select
                        value={draft.levelLabel}
                        onValueChange={(value) => {
                          const currentDefaultDepartment = defaultDepartmentName(department, draft.levelLabel);
                          const shouldUseDefaultDepartment = !draft.departmentName.trim() || draft.departmentName.trim() === currentDefaultDepartment;
                          updateDraft(draft.localKey, {
                            levelLabel: value,
                            departmentName: shouldUseDefaultDepartment ? defaultDepartmentName(department, value) : draft.departmentName,
                            sortOrder: String(sortForLevel(value)),
                          });
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {levelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <Input value={draft.departmentName} onChange={(event) => updateDraft(draft.localKey, { departmentName: event.target.value })} />
                        {!draft.id ? <div className="text-[11px] font-semibold text-amber-600">ยังไม่บันทึกลงฐานข้อมูล</div> : null}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Input className="w-24" type="number" min={0} value={draft.studentCount} onChange={(event) => updateDraft(draft.localKey, { studentCount: event.target.value })} />
                    </td>
                    <td className="px-3 py-3">
                      <Input className="w-24" type="number" min={0} value={draft.actualCount} onChange={(event) => updateDraft(draft.localKey, { actualCount: event.target.value })} />
                    </td>
                    <td className="px-3 py-3">
                      <Input className="w-24" type="number" min={0} value={draft.registeredCount} onChange={(event) => updateDraft(draft.localKey, { registeredCount: event.target.value })} />
                    </td>
                    <td className="px-3 py-3">
                      <Input className="w-20" type="number" min={0} value={draft.maleCount} onChange={(event) => updateDraft(draft.localKey, { maleCount: event.target.value })} />
                    </td>
                    <td className="px-3 py-3">
                      <Input className="w-20" type="number" min={0} value={draft.femaleCount} onChange={(event) => updateDraft(draft.localKey, { femaleCount: event.target.value })} />
                    </td>
                    <td className="px-3 py-3">
                      <Textarea className="min-h-10 w-56" value={draft.note} onChange={(event) => updateDraft(draft.localKey, { note: event.target.value })} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" onClick={() => void saveDraft(draft)} disabled={Boolean(workingKey)}>
                          {isWorking ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                          บันทึก
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => void deleteDraft(draft)} disabled={Boolean(workingKey)}>
                          <Trash2 className="size-4" />
                          ลบ
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!drafts.length ? (
          <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/40 p-6 text-sm text-slate-600">
            <div className="font-semibold text-slate-900">ยังไม่มีแถวข้อมูลของแผนกนี้ในปีการศึกษาที่เลือก</div>
            <p className="mt-2">กดปุ่ม “เติมแถวมาตรฐานที่ขาด” เพื่อสร้างชุดข้อมูล ปวช.1-3 และ ปวส. 4 ช่องพร้อมกรอกทันที</p>
            <Button type="button" className="mt-4" size="sm" onClick={addMissingRows}>
              <Plus data-icon="inline-start" />
              สร้างชุดแถวเริ่มต้น
            </Button>
          </div>
        ) : null}

        {message ? <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</div> : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            หากต้องการแยกกลุ่มเรียนย่อย เช่น ทวิภาคี สายตรง หรือภาคสมทบ ให้เพิ่มเป็นคนละแถว ระบบจะรวมให้ในตารางหลักอัตโนมัติ
          </p>
          <Button type="button" onClick={() => void saveAll()} disabled={!drafts.length || Boolean(workingKey)}>
            <Save data-icon="inline-start" />
            บันทึกทั้งหมด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
