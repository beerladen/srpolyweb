"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, FileUp, ImageUp, Pencil, Plus, Save, Trash2 } from "lucide-react";
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminUser } from "@/lib/admin-auth";
import { canAccess } from "@/lib/permissions";
import { apiPath, withBasePath } from "@/lib/base-path";
import type { ContentPageItem } from "@/lib/site-data";

type ContentPageAdminToolsProps = {
  user?: AdminUser | null;
  page?: ContentPageItem;
  label?: string;
  className?: string;
  afterDeleteHref?: string;
};

type SavedContentPage = ContentPageItem & {
  href: string;
};

const statusOptions = [
  { value: "published", label: "เผยแพร่" },
  { value: "draft", label: "ร่าง" },
  { value: "review", label: "รอตรวจ" },
  { value: "archived", label: "เก็บถาวร" },
];

const navOptions = [
  { value: "none", label: "ไม่ผูกกับเมนูหลัก" },
  { value: "about", label: "เกี่ยวกับวิทยาลัย" },
  { value: "students", label: "นักเรียน/นักศึกษา" },
  { value: "services", label: "บริการ" },
  { value: "ita", label: "ITA" },
  { value: "contact", label: "ติดต่อเรา" },
];

const contentTypeOptions = [
  { value: "general", label: "หน้าเนื้อหาทั่วไป" },
  { value: "structure", label: "โครงสร้าง / แผนผัง" },
  { value: "people", label: "ผู้บริหาร / บุคลากร" },
  { value: "committee", label: "คณะกรรมการ" },
  { value: "document", label: "เอกสาร / ระเบียบ" },
  { value: "ita", label: "ITA / OIT" },
  { value: "faq", label: "คำถามพบบ่อย" },
];

function redirectToSignIn() {
  window.location.assign(withBasePath("/signin"));
}

function publicUploadPath(value: string): string | null {
  const rawValue = value.trim();

  if (!rawValue) {
    return null;
  }

  if (rawValue.startsWith("http://") || rawValue.startsWith("https://") || rawValue.startsWith("/")) {
    return withBasePath(rawValue);
  }

  return withBasePath(`/${rawValue.replace(/^\.?\//, "")}`);
}

export function ContentPageAdminTools({
  user,
  page,
  label,
  className,
  afterDeleteHref = "/admin/modules/content_pages",
}: ContentPageAdminToolsProps) {
  const router = useRouter();
  const fieldId = useId();
  const isEditing = Boolean(page);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(page?.title ?? "");
  const [summary, setSummary] = useState(page?.summary ?? "");
  const [body, setBody] = useState(page?.body ?? "");
  const [contentType, setContentType] = useState(page?.contentType ?? "general");
  const [coverImage, setCoverImage] = useState(page?.coverImage ?? "");
  const [attachmentPath, setAttachmentPath] = useState(page?.attachmentPath ?? "");
  const [sourceUrl, setSourceUrl] = useState(page?.sourceUrl ?? "");
  const [navKey, setNavKey] = useState(page?.navKey ?? "none");
  const [status, setStatus] = useState(page?.status ?? "published");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingField, setUploadingField] = useState<"cover_image" | "attachment_path" | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const triggerLabel = label ?? (isEditing ? "แก้ไขหน้านี้" : "เพิ่มหน้าเนื้อหา");

  if (!user || !canAccess(user.effectivePermissions, "content_pages")) {
    return null;
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    const payload = {
      title,
      summary,
      body,
      contentType,
      coverImage,
      attachmentPath,
      sourceUrl,
      navKey: navKey === "none" ? "" : navKey,
      status,
    };
    const response = await fetch(apiPath(isEditing ? `/api/admin/content-pages/${page?.id}` : "/api/admin/content-pages"), {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      redirectToSignIn();
      return;
    }

    const result = (await response.json().catch(() => null)) as { message?: string; page?: SavedContentPage } | null;

    setIsSaving(false);

    if (!response.ok) {
      const errorMessage = result?.message ?? "ยังบันทึกไม่ได้ โปรดลองอีกครั้งหรือตรวจสอบสิทธิ์ผู้ใช้";
      setMessage(errorMessage);
      showAppToast({ type: "error", title: "บันทึกไม่สำเร็จ", message: errorMessage });
      return;
    }

    const successMessage = isEditing ? "อัปเดตข้อมูลสำเร็จ" : "สร้างหน้าใหม่สำเร็จ";
    setMessage(successMessage);
    setOpen(false);
    showAppToast({ type: "success", title: successMessage, message: "บันทึกหน้าเนื้อหาเรียบร้อยแล้ว" });
    router.refresh();

    if (!isEditing && result?.page) {
      setTitle(result.page.title);
      setSummary(result.page.summary);
      setBody(result.page.body);
      setContentType(result.page.contentType ?? "general");
      setCoverImage(result.page.coverImage ?? "");
      setAttachmentPath(result.page.attachmentPath ?? "");
      setSourceUrl(result.page.sourceUrl ?? "");
      setNavKey(result.page.navKey ?? "none");
      setStatus(result.page.status);
      router.push("/admin/modules/content_pages");
    }
  }

  async function handleUpload(fieldName: "cover_image" | "attachment_path", file?: File) {
    if (!file) {
      return;
    }

    setUploadingField(fieldName);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("moduleKey", "content_pages");
    formData.append("fieldName", fieldName);

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
      setMessage(result?.message ?? "ยังอัปโหลดไฟล์ไม่ได้");
      return;
    }

    if (fieldName === "cover_image") {
      setCoverImage(result.path);
      setMessage("อัปโหลดภาพแล้ว กดอัปเดตเพื่อบันทึกการเปลี่ยนแปลง");
    } else {
      setAttachmentPath(result.path);
      setMessage("อัปโหลดไฟล์แล้ว กดอัปเดตเพื่อบันทึกการเปลี่ยนแปลง");
    }
  }

  async function handleDelete() {
    if (!page) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    const response = await fetch(apiPath(`/api/admin/content-pages/${page.id}`), { method: "DELETE" });

    if (response.status === 401) {
      redirectToSignIn();
      return;
    }

    const result = (await response.json().catch(() => null)) as { message?: string } | null;

    setIsDeleting(false);

    if (!response.ok) {
      const errorMessage = result?.message ?? "ยังลบไม่ได้ โปรดลองอีกครั้งหรือตรวจสอบสิทธิ์ผู้ใช้";
      setMessage(errorMessage);
      showAppToast({ type: "error", title: "ลบไม่สำเร็จ", message: errorMessage });
      return;
    }

    setMessage("ลบหน้าเนื้อหาแล้ว");
    setOpen(false);
    showAppToast({ type: "success", title: "ลบหน้าเนื้อหาสำเร็จ", message: "ลบข้อมูลเรียบร้อยแล้ว" });
    router.refresh();
    router.push(afterDeleteHref);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {isEditing ? <Pencil data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "อัปเดตข้อมูลหน้าเนื้อหา" : "เพิ่มหน้าเนื้อหา"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "แก้ไข อัปเดต เปิดดู หรือลบหน้าเนื้อหานี้ได้จาก modal เดียว"
              : "สร้างหน้าเนื้อหาใหม่สำหรับเชื่อมกับเมนู Navbar หรือเปิดจัดการต่อในแอดมิน"}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <div className="grid gap-4">
            <Field>
              <FieldLabel htmlFor={`${fieldId}-title`}>หัวข้อ</FieldLabel>
              <Input
                id={`${fieldId}-title`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${fieldId}-content-type`}>ชนิดหน้า</FieldLabel>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger id={`${fieldId}-content-type`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${fieldId}-nav-key`}>ผูกกับเมนูหลัก</FieldLabel>
              <Select value={navKey} onValueChange={setNavKey}>
                <SelectTrigger id={`${fieldId}-nav-key`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {navOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${fieldId}-status`}>สถานะ</FieldLabel>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id={`${fieldId}-status`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${fieldId}-source-url`}>ลิงก์ต้นฉบับ / ลิงก์อ้างอิง</FieldLabel>
              <Input
                id={`${fieldId}-source-url`}
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor={`${fieldId}-summary`}>คำอธิบายสั้น</FieldLabel>
            <Textarea
              id={`${fieldId}-summary`}
              className="min-h-24"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${fieldId}-cover-image`}>ภาพประกอบ / ภาพผัง</FieldLabel>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  id={`${fieldId}-cover-image`}
                  value={coverImage}
                  onChange={(event) => setCoverImage(event.target.value)}
                  placeholder="/uploads/images/structure.png"
                />
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
                  <ImageUp className="size-4" />
                  {uploadingField === "cover_image" ? "กำลังอัปโหลด" : "อัปโหลดภาพ"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploadingField === "cover_image"}
                    onChange={(event) => {
                      void handleUpload("cover_image", event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              {publicUploadPath(coverImage) ? (
                <div
                  className="min-h-32 rounded-md border bg-muted bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url("${publicUploadPath(coverImage)}")` }}
                  aria-label="ตัวอย่างภาพประกอบหน้าเนื้อหา"
                />
              ) : null}
              <FieldDescription>ใช้สำหรับภาพผังโครงสร้าง ภาพประกอบหน้าหน่วยงาน หรือภาพสื่อสารของหน้านี้</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${fieldId}-attachment-path`}>ไฟล์แนบ / เอกสาร</FieldLabel>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  id={`${fieldId}-attachment-path`}
                  value={attachmentPath}
                  onChange={(event) => setAttachmentPath(event.target.value)}
                  placeholder="/uploads/documents/file.pdf"
                />
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
                  <FileUp className="size-4" />
                  {uploadingField === "attachment_path" ? "กำลังอัปโหลด" : "อัปโหลดไฟล์"}
                  <input
                    type="file"
                    accept="application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    className="sr-only"
                    disabled={uploadingField === "attachment_path"}
                    onChange={(event) => {
                      void handleUpload("attachment_path", event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              {publicUploadPath(attachmentPath) ? (
                <Button asChild variant="outline" size="sm" className="w-fit">
                  <Link href={publicUploadPath(attachmentPath) ?? "#"} target="_blank" rel="noreferrer">
                    <Eye data-icon="inline-start" />
                    เปิดไฟล์แนบ
                  </Link>
                </Button>
              ) : null}
              <FieldDescription>รองรับ PDF, Word, Excel และ PowerPoint</FieldDescription>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-body`}>เนื้อหา</FieldLabel>
            <Textarea
              id={`${fieldId}-body`}
              className="min-h-64 font-mono text-sm"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
            <FieldDescription>รองรับเนื้อหา HTML เดิมจากระบบเก่า</FieldDescription>
          </Field>
        </FieldGroup>

        {isEditing ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-destructive">ลบหน้าเนื้อหา</div>
                <p className="text-sm leading-6 text-muted-foreground">
                  เมื่อลบแล้วหน้า URL นี้จะไม่แสดงบนเว็บไซต์อีก
                </p>
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
            {isEditing ? (
              <Button asChild variant="outline">
                <Link href={`/content/${page?.slug}`}>
                  <Eye data-icon="inline-start" />
                  เปิดดูหน้า
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/admin/modules/content_pages">เปิดในแอดมิน</Link>
            </Button>
          </div>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            <Save data-icon="inline-start" />
            {isSaving ? "กำลังบันทึก" : isEditing ? "อัปเดตข้อมูล" : "สร้างหน้า"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ContentPageCreateButton({
  user,
  className,
}: {
  user?: AdminUser | null;
  className?: string;
}) {
  return <ContentPageAdminTools user={user} className={className} />;
}
