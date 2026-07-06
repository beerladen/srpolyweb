"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, ExternalLink, FileUp, ImageUp, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCrudField, AdminCrudRow, AdminCrudValue } from "@/lib/admin-crud-config";
import type { AdminUser } from "@/lib/admin-auth";
import { apiPath, withBasePath } from "@/lib/base-path";
import { canAccess } from "@/lib/permissions";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

type AdminCrudToolsProps = {
  user?: AdminUser | null;
  permission: string;
  moduleKey: string;
  moduleLabel: string;
  fields: AdminCrudField[];
  row?: AdminCrudRow;
  label?: string;
  className?: string;
  afterDeleteHref?: string;
  afterCreateHref?: string | null;
  adminHref?: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
};

type SavedItemResponse = {
  message?: string;
  item?: AdminCrudRow;
};

function initialValue(field: AdminCrudField): AdminCrudValue {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  if (field.type === "switch") {
    return false;
  }

  return "";
}

function makeInitialValues(fields: AdminCrudField[], row?: AdminCrudRow): Record<string, AdminCrudValue> {
  return Object.fromEntries(
    fields.map((field) => [field.name, row?.values[field.name] ?? initialValue(field)])
  );
}

function textInputValue(value: AdminCrudValue): string {
  return value === null || value === undefined ? "" : String(value);
}

function redirectToSignIn() {
  window.location.assign(withBasePath("/signin"));
}

export function AdminCrudTools({
  user,
  permission,
  moduleKey,
  moduleLabel,
  fields,
  row,
  label,
  className,
  afterDeleteHref,
  afterCreateHref,
  adminHref = `/admin/modules/${moduleKey}`,
  triggerVariant,
  triggerSize,
}: AdminCrudToolsProps) {
  const router = useRouter();
  const fieldId = useId();
  const isEditing = Boolean(row);
  const triggerLabel = label ?? (isEditing ? "จัดการ" : "เพิ่มรายการ");
  const defaultValues = useMemo(() => makeInitialValues(fields, row), [fields, row]);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, AdminCrudValue>>(defaultValues);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!user || !canAccess(user.effectivePermissions, permission)) {
    return null;
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setValues(defaultValues);
      setMessage(null);
      setShowDeleteConfirm(false);
    }
  }

  function setFieldValue(name: string, value: AdminCrudValue) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    const response = await fetch(
      apiPath(isEditing ? `/api/admin/modules/${moduleKey}/items/${row?.id}` : `/api/admin/modules/${moduleKey}/items`),
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );

    if (response.status === 401) {
      redirectToSignIn();
      return;
    }

    const result = (await response.json().catch(() => null)) as SavedItemResponse | null;

    setIsSaving(false);

    if (!response.ok) {
      setMessage(result?.message ?? "ยังบันทึกข้อมูลไม่ได้ โปรดลองอีกครั้ง");
      return;
    }

    setMessage(isEditing ? "อัปเดตแล้ว" : "สร้างรายการแล้ว");
    router.refresh();

    if (!isEditing) {
      if (afterCreateHref !== null) {
        router.push(afterCreateHref ?? adminHref);
      }
    }

    if (result?.item) {
      setValues(makeInitialValues(fields, result.item));
    }
  }

  async function handleDelete() {
    if (!row) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    const response = await fetch(apiPath(`/api/admin/modules/${moduleKey}/items/${row.id}`), { method: "DELETE" });

    if (response.status === 401) {
      redirectToSignIn();
      return;
    }

    const result = (await response.json().catch(() => null)) as { message?: string } | null;

    setIsDeleting(false);

    if (!response.ok) {
      setMessage(result?.message ?? "ยังลบรายการไม่ได้ โปรดลองอีกครั้ง");
      return;
    }

    setMessage("ลบรายการแล้ว");
    setOpen(false);
    router.refresh();
    router.push(afterDeleteHref ?? adminHref);
  }

  async function handleFileUpload(field: AdminCrudField, file?: File) {
    if (!file) {
      return;
    }

    setUploadingField(field.name);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("moduleKey", moduleKey);
    formData.append("fieldName", field.name);

    const response = await fetch(apiPath("/api/admin/uploads"), {
      method: "POST",
      body: formData,
    });

    if (response.status === 401) {
      redirectToSignIn();
      return;
    }

    const result = (await response.json().catch(() => null)) as { message?: string; path?: string } | null;

    setUploadingField(null);

    if (!response.ok || !result?.path) {
      setMessage(result?.message ?? (field.type === "image" ? "ยังอัปโหลดภาพไม่ได้" : "ยังอัปโหลดไฟล์ไม่ได้"));
      return;
    }

    setFieldValue(field.name, result.path);
    setMessage(field.type === "image" ? "อัปโหลดภาพแล้ว กดอัปเดตเพื่อบันทึกการเปลี่ยนแปลง" : "อัปโหลดไฟล์แล้ว กดอัปเดตเพื่อบันทึกการเปลี่ยนแปลง");
  }

  function publicUploadPath(value: AdminCrudValue): string | null {
    const rawValue = textInputValue(value);

    if (!rawValue) {
      return null;
    }

    if (rawValue.startsWith("http://") || rawValue.startsWith("https://") || rawValue.startsWith("/")) {
      return withBasePath(rawValue);
    }

    return withBasePath(`/${rawValue.replace(/^\.?\//, "")}`);
  }

  function renderField(field: AdminCrudField) {
    const id = `${fieldId}-${field.name}`;
    const value = values[field.name];

    if (field.type === "textarea") {
      return (
        <Field key={field.name} className={field.span === "full" ? "md:col-span-2" : undefined}>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <Textarea
            id={id}
            className="min-h-28"
            value={textInputValue(value)}
            placeholder={field.placeholder}
            onChange={(event) => setFieldValue(field.name, event.target.value)}
          />
          {field.description ? <FieldDescription>{field.description}</FieldDescription> : null}
        </Field>
      );
    }

    if (field.type === "select") {
      return (
        <Field key={field.name}>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <Select value={textInputValue(value)} onValueChange={(nextValue) => setFieldValue(field.name, nextValue)}>
            <SelectTrigger id={id} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description ? <FieldDescription>{field.description}</FieldDescription> : null}
        </Field>
      );
    }

    if (field.type === "image") {
      const imagePath = publicUploadPath(value);

      return (
        <Field key={field.name} className={field.span === "full" ? "md:col-span-2" : undefined}>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              id={id}
              value={textInputValue(value)}
              placeholder={field.placeholder}
              onChange={(event) => setFieldValue(field.name, event.target.value)}
            />
            <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
              <ImageUp className="size-4" />
              {uploadingField === field.name ? "กำลังอัปโหลด" : "อัปโหลดภาพ"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                disabled={uploadingField === field.name}
                onChange={(event) => {
                  void handleFileUpload(field, event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {imagePath ? (
            <div
              className="min-h-32 rounded-md border bg-muted bg-cover bg-center"
              style={{ backgroundImage: `url("${imagePath}")` }}
              aria-label={`ตัวอย่าง${field.label}`}
            />
          ) : null}
          <FieldDescription>{field.description ?? "เลือกไฟล์ภาพแล้วระบบจะเติม path ให้อัตโนมัติ จากนั้นกดบันทึก"}</FieldDescription>
        </Field>
      );
    }

    if (field.type === "file") {
      const filePath = publicUploadPath(value);

      return (
        <Field key={field.name} className={field.span === "full" ? "md:col-span-2" : undefined}>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              id={id}
              value={textInputValue(value)}
              placeholder={field.placeholder}
              onChange={(event) => setFieldValue(field.name, event.target.value)}
            />
            <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
              <FileUp className="size-4" />
              {uploadingField === field.name ? "กำลังอัปโหลด" : "อัปโหลดไฟล์"}
              <input
                type="file"
                accept="application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif"
                className="sr-only"
                disabled={uploadingField === field.name}
                onChange={(event) => {
                  void handleFileUpload(field, event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {filePath ? (
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href={filePath} target="_blank" rel="noreferrer">
                <Eye data-icon="inline-start" />
                เปิดไฟล์แนบ
              </Link>
            </Button>
          ) : null}
          <FieldDescription>{field.description ?? "อัปโหลด PDF, Word, Excel, PowerPoint, ZIP, TXT, CSV หรือรูปภาพ แล้วกดบันทึก"}</FieldDescription>
        </Field>
      );
    }

    if (field.type === "switch") {
      return (
        <Field key={field.name} orientation="horizontal" className="rounded-md border p-3">
          <FieldContent>
            <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
            {field.description ? <FieldDescription>{field.description}</FieldDescription> : null}
          </FieldContent>
          <Switch
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(checked) => setFieldValue(field.name, checked)}
          />
        </Field>
      );
    }

    return (
      <Field key={field.name} className={field.span === "full" ? "md:col-span-2" : undefined}>
        <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
        <Input
          id={id}
          type={field.type === "datetime" ? "datetime-local" : field.type}
          value={textInputValue(value)}
          placeholder={field.placeholder}
          onChange={(event) => setFieldValue(field.name, event.target.value)}
        />
        {field.description ? <FieldDescription>{field.description}</FieldDescription> : null}
      </Field>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant ?? (isEditing ? "outline" : "default")}
          size={triggerSize ?? (isEditing ? "sm" : "default")}
          className={className}
        >
          {isEditing ? <Pencil data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? `จัดการ${moduleLabel}` : `เพิ่ม${moduleLabel}`}</DialogTitle>
          <DialogDescription>
            {isEditing ? row?.title : `สร้างรายการใหม่ใน${moduleLabel}`}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">{fields.map(renderField)}</div>
        </FieldGroup>

        {isEditing ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-destructive">ลบรายการ</div>
                <p className="text-sm leading-6 text-muted-foreground">{row?.title}</p>
              </div>
              {showDeleteConfirm ? (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                    ยกเลิก
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                    <Trash2 data-icon="inline-start" />
                    {isDeleting ? "กำลังลบ" : "ยืนยันลบ"}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 data-icon="inline-start" />
                  ลบ
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {isEditing && row?.href && row.href !== "#" ? (
              <Button asChild variant="outline">
                <Link href={row.href}>
                  <Eye data-icon="inline-start" />
                  เปิดดูหน้า
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={adminHref}>
                <ExternalLink data-icon="inline-start" />
                เปิดในแอดมิน
              </Link>
            </Button>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save data-icon="inline-start" />
            {isSaving ? "กำลังบันทึก" : isEditing ? "อัปเดต" : "สร้างรายการ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminCrudCreateButton(props: Omit<AdminCrudToolsProps, "row">) {
  return <AdminCrudTools {...props} label={props.label ?? "เพิ่มรายการ"} triggerVariant="default" triggerSize="default" />;
}
