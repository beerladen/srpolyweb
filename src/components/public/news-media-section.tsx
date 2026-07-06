"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/base-path";
import { fileNameFromPath, inferFileType, type MediaItem, type MediaLinkItem } from "@/lib/media-fields";

type NewsMediaSectionProps = {
  galleryImages?: MediaItem[];
  attachments?: MediaItem[];
  externalLinks?: MediaLinkItem[];
};

function publicPath(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("#")) {
    return path;
  }

  return withBasePath(path.startsWith("/") ? path : `/${path.replace(/^\.?\//, "")}`);
}

function isPdf(item: MediaItem): boolean {
  return inferFileType(item.path, item.type) === "PDF";
}

export function NewsMediaSection({ galleryImages = [], attachments = [], externalLinks = [] }: NewsMediaSectionProps) {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const pdfAttachments = attachments.filter(isPdf);
  const hasContent = galleryImages.length || attachments.length || externalLinks.length;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-col gap-6 border-t pt-6">
      {galleryImages.length ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              <ImageIcon className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">ภาพประกอบข่าว</h2>
              <p className="text-xs text-slate-500">คลิกที่ภาพเพื่อดูขนาดใหญ่</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image, index) => (
              <button
                key={`${image.path}-${index}`}
                type="button"
                className="group overflow-hidden rounded-lg border border-blue-100 bg-white text-left shadow-sm shadow-blue-950/5 outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-300"
                onClick={() => setSelectedImage(image)}
              >
                <span
                  className="block aspect-[4/3] bg-slate-100 bg-cover bg-center transition duration-300 group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url("${publicPath(image.path)}")` }}
                />
                <span className="block truncate px-3 py-2 text-xs font-medium text-slate-600">
                  {image.name ?? fileNameFromPath(image.path)}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {pdfAttachments.length ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-red-50 text-red-700">
              <FileText className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">เอกสาร PDF ประกอบข่าว</h2>
              <p className="text-xs text-slate-500">แสดงต่อจากเนื้อหาข่าวและดาวน์โหลดได้</p>
            </div>
          </div>
          {pdfAttachments.map((file, index) => (
            <div key={`${file.path}-${index}`} className="overflow-hidden rounded-lg border border-red-100 bg-white shadow-sm shadow-red-950/5">
              <div className="flex flex-col gap-2 border-b border-red-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-950">{file.name ?? fileNameFromPath(file.path)}</h3>
                  <p className="text-xs text-slate-500">PDF{file.sizeKb ? ` - ${file.sizeKb.toLocaleString("th-TH")} KB` : ""}</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href={publicPath(file.path)} target="_blank" rel="noreferrer">
                    <Download data-icon="inline-start" />
                    ดาวน์โหลด PDF
                  </a>
                </Button>
              </div>
              <iframe
                title={file.name ?? fileNameFromPath(file.path)}
                src={publicPath(file.path)}
                className="h-[520px] w-full bg-slate-50"
              />
            </div>
          ))}
        </section>
      ) : null}

      {attachments.length ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <Download className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">ไฟล์แนบให้ดาวน์โหลด</h2>
              <p className="text-xs text-slate-500">เอกสารและไฟล์ประกอบข่าว</p>
            </div>
          </div>
          <div className="divide-y rounded-lg border border-blue-100 bg-white">
            {attachments.map((file, index) => (
              <div key={`${file.path}-${index}`} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-950">{file.name ?? fileNameFromPath(file.path)}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {inferFileType(file.path, file.type)}
                    {file.sizeKb ? ` - ${file.sizeKb.toLocaleString("th-TH")} KB` : ""}
                  </p>
                </div>
                <Button asChild size="sm">
                  <a href={publicPath(file.path)} target="_blank" rel="noreferrer">
                    <Download data-icon="inline-start" />
                    ดาวน์โหลด
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {externalLinks.length ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
              <ExternalLink className="size-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-950">ลิงก์ที่เกี่ยวข้อง</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {externalLinks.map((link, index) => (
              <a
                key={`${link.url}-${index}`}
                href={publicPath(link.url)}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                <span className="truncate">{link.label}</span>
                <ExternalLink className="size-4 shrink-0" />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {selectedImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
            onClick={() => setSelectedImage(null)}
          >
            <X className="size-5" />
            <span className="sr-only">ปิดภาพขยาย</span>
          </button>
          <div
            className="h-[82vh] w-full max-w-6xl rounded-lg bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${publicPath(selectedImage.path)}")` }}
            aria-label={selectedImage.name ?? fileNameFromPath(selectedImage.path)}
          />
        </div>
      ) : null}
    </div>
  );
}
