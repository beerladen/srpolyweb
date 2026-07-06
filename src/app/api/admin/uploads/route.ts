import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig } from "@/lib/admin-crud-server";
import { canAccess } from "@/lib/permissions";

const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const allowedDocumentMimeTypes = new Map([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.ms-excel", "xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
  ["application/vnd.ms-powerpoint", "ppt"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
  ["application/zip", "zip"],
  ["application/x-zip-compressed", "zip"],
  ["text/plain", "txt"],
  ["text/csv", "csv"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const allowedDocumentExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
  "txt",
  "csv",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
]);

const maxImageUploadBytes = 5 * 1024 * 1024;
const maxDocumentUploadBytes = 20 * 1024 * 1024;

function safeUploadFolder(value: unknown, fallback: "images" | "documents"): "images" | "news" | "personnel" | "documents" {
  return value === "news" || value === "personnel" || value === "documents" ? value : fallback;
}

function extensionFromName(filename: string, allowed: Set<string>): string | null {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension && allowed.has(extension) ? (extension === "jpeg" ? "jpg" : extension) : null;
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const moduleKey = String(formData?.get("moduleKey") ?? "");
  const fieldName = String(formData?.get("fieldName") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "กรุณาเลือกไฟล์ภาพ" }, { status: 400 });
  }

  const user = await getSignedInAdminUser();
  const config = moduleKey ? await getAdminCrudAvailableConfig(moduleKey) : null;
  const field = config?.fields.find((item) => item.name === fieldName);

  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบใหม่" }, { status: 401 });
  }

  if (!config || !canAccess(user.effectivePermissions, config.permission)) {
    return NextResponse.json({ message: "ไม่มีสิทธิ์อัปโหลดไฟล์ในเมนูนี้" }, { status: 403 });
  }

  if (!field || (field.type !== "image" && field.type !== "file")) {
    return NextResponse.json({ message: "ช่องนี้ไม่รองรับการอัปโหลดไฟล์" }, { status: 400 });
  }

  if (field.type === "image" && file.size > maxImageUploadBytes) {
    return NextResponse.json({ message: "ไฟล์ภาพต้องไม่เกิน 5MB" }, { status: 400 });
  }

  if (field.type === "file" && file.size > maxDocumentUploadBytes) {
    return NextResponse.json({ message: "ไฟล์เอกสารต้องไม่เกิน 20MB" }, { status: 400 });
  }

  const extension = field.type === "image"
    ? allowedMimeTypes.get(file.type) ?? extensionFromName(file.name, new Set(allowedMimeTypes.values()))
    : allowedDocumentMimeTypes.get(file.type) ?? extensionFromName(file.name, allowedDocumentExtensions);

  if (!extension) {
    return NextResponse.json(
      { message: field.type === "image" ? "รองรับเฉพาะไฟล์ JPG, PNG, WEBP หรือ GIF" : "รองรับไฟล์ PDF, Word, Excel, PowerPoint, ZIP, TXT, CSV และรูปภาพ" },
      { status: 400 }
    );
  }

  const folder = safeUploadFolder(field.uploadFolder, field.type === "image" ? "images" : "documents");
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  const filename = `${moduleKey}-${fieldName}-${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);

  return NextResponse.json({
    ok: true,
    path: `/uploads/${folder}/${filename}`,
  });
}
