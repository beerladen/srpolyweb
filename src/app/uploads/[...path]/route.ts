import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";

const contentTypes = new Map([
  ["csv", "text/csv; charset=utf-8"],
  ["doc", "application/msword"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["gif", "image/gif"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["ppt", "application/vnd.ms-powerpoint"],
  ["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ["txt", "text/plain; charset=utf-8"],
  ["webp", "image/webp"],
  ["xls", "application/vnd.ms-excel"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ["zip", "application/zip"],
]);

function uploadRoot() {
  return path.join(process.cwd(), "public", "uploads");
}

function resolveUploadPath(segments: string[]): string | null {
  if (!segments.length || segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return null;
  }

  const root = uploadRoot();
  const filePath = path.resolve(root, ...segments);
  const relativePath = path.relative(root, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

async function serveUpload(segments: string[], method: "GET" | "HEAD") {
  const filePath = resolveUploadPath(segments);

  if (!filePath) {
    return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 404 });
  }

  const fileStat = await stat(filePath).catch(() => null);

  if (!fileStat?.isFile()) {
    return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 404 });
  }

  const extension = path.extname(filePath).replace(".", "").toLowerCase();
  const headers = new Headers({
    "Cache-Control": "public, max-age=60",
    "Content-Length": String(fileStat.size),
    "Content-Type": contentTypes.get(extension) ?? "application/octet-stream",
  });

  if (method === "HEAD") {
    return new Response(null, { headers });
  }

  return new Response(Readable.toWeb(createReadStream(filePath)) as ReadableStream, { headers });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path: uploadPath = [] } = await params;

  return serveUpload(uploadPath, "GET");
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path: uploadPath = [] } = await params;

  return serveUpload(uploadPath, "HEAD");
}
