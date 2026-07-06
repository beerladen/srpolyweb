"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { withBasePath } from "@/lib/base-path";
import type { AdminUser } from "@/lib/admin-auth";
import type { AdminCrudModuleConfig, AdminCrudRow } from "@/lib/admin-crud-config";
import type { DownloadCenterData, DownloadDocument } from "@/lib/document-data";
import { cn } from "@/lib/utils";

type DownloadCenterProps = DownloadCenterData & {
  adminUser?: AdminUser | null;
  crudConfig?: AdminCrudModuleConfig | null;
  crudRows?: AdminCrudRow[] | null;
  categoryConfig?: AdminCrudModuleConfig | null;
};

const allValue = "all";
const defaultPageSize = 10;
const pageSizeOptions = [10, 25, 50, 100];

const fileTypeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  DOC: FileType2,
  DOCX: FileType2,
  XLS: FileSpreadsheet,
  XLSX: FileSpreadsheet,
  PPT: FileType2,
  PPTX: FileType2,
  ZIP: FileArchive,
  IMAGE: FileImage,
};

function formatNumber(value: number): string {
  return value.toLocaleString("th-TH");
}

function formatDate(value?: string): string {
  return value ? value.slice(0, 10) : "ยังไม่ระบุ";
}

function formatFileSize(value?: number): string {
  if (!value) {
    return "ไม่ระบุ";
  }

  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)} MB`;
  }

  return `${formatNumber(value)} KB`;
}

function searchableText(document: DownloadDocument): string {
  return [
    document.title,
    document.description,
    document.categoryName,
    document.department,
    document.responsiblePerson,
    document.fileType,
    document.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function documentMatches(
  document: DownloadDocument,
  query: string,
  category: string,
  department: string,
  fileType: string
): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery && !searchableText(document).includes(normalizedQuery)) {
    return false;
  }

  if (category !== allValue && document.categorySlug !== category) {
    return false;
  }

  if (department !== allValue && document.department !== department) {
    return false;
  }

  if (fileType !== allValue && document.fileType !== fileType) {
    return false;
  }

  return true;
}

function fileTypeTone(fileType: string): string {
  if (fileType === "PDF") return "border-red-200 bg-red-50 text-red-700";
  if (fileType === "XLS" || fileType === "XLSX") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (fileType === "DOC" || fileType === "DOCX") return "border-blue-200 bg-blue-50 text-blue-700";
  if (fileType === "ZIP") return "border-amber-200 bg-amber-50 text-amber-700";
  if (fileType === "IMAGE") return "border-cyan-200 bg-cyan-50 text-cyan-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function DocumentRow({
  document,
  crudConfig,
  crudRow,
  adminUser,
}: {
  document: DownloadDocument;
  crudConfig?: AdminCrudModuleConfig | null;
  crudRow?: AdminCrudRow;
  adminUser?: AdminUser | null;
}) {
  const Icon = fileTypeIcons[document.fileType] ?? FileText;

  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.75fr)_100px_120px_220px] lg:items-center">
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md border", fileTypeTone(document.fileType))}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <Link href={`/documents/${document.id}`} className="block truncate font-bold leading-6 text-slate-950 hover:text-blue-700">
              {document.title}
            </Link>
            <p className="mt-1 line-clamp-1 text-sm leading-6 text-slate-600">{document.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {document.isFeatured ? (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                  <Star className="size-3" />
                  แนะนำ
                </Badge>
              ) : null}
              <Badge variant="outline">{document.categoryName}</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="min-w-0 text-sm">
        <span className="block truncate font-semibold text-slate-800">{document.department}</span>
        <span className="mt-1 block truncate text-xs text-slate-500">{document.responsiblePerson ?? "ไม่ระบุผู้รับผิดชอบ"}</span>
      </div>
      <div>
        <Badge variant="outline" className={fileTypeTone(document.fileType)}>
          {document.fileType}
        </Badge>
        <span className="mt-1 block text-xs text-slate-500">{formatFileSize(document.fileSizeKb)}</span>
        <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <CalendarDays className="size-4" />
          {formatDate(document.publishedAt ?? document.updatedAt)}
        </span>
      </div>
      <div className="rounded-md bg-blue-50 px-3 py-2 text-left lg:text-center">
        <strong className="block text-lg font-extrabold text-blue-800">{formatNumber(document.downloadCount)}</strong>
        <span className="text-xs text-blue-700">ครั้ง</span>
      </div>
      <div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {crudConfig && crudRow ? (
            <AdminCrudTools
              user={adminUser}
              permission={crudConfig.permission}
              moduleKey={crudConfig.key}
              moduleLabel={crudConfig.label}
              fields={crudConfig.fields}
              row={crudRow}
              label="จัดการ"
              triggerSize="sm"
              adminHref={`/admin/modules/${crudConfig.key}`}
              afterDeleteHref={`/admin/modules/${crudConfig.key}`}
            />
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/documents/${document.id}`}>
              เปิด
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild size="sm">
            <a href={withBasePath(`/api/documents/${document.id}/download`)} target="_blank" rel="noreferrer">
              <Download data-icon="inline-start" />
              ดาวน์โหลด
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DownloadCenter({
  documents,
  categories,
  departments,
  fileTypes,
  adminUser,
  crudConfig,
  crudRows,
  categoryConfig,
}: DownloadCenterProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(allValue);
  const [department, setDepartment] = useState(allValue);
  const [fileType, setFileType] = useState(allValue);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const crudRowsById = useMemo(() => new Map((crudRows ?? []).map((row) => [row.id, row])), [crudRows]);
  const filteredDocuments = useMemo(
    () => documents.filter((document) => documentMatches(document, query, category, department, fileType)),
    [category, department, documents, fileType, query]
  );
  const pageCount = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const pageStart = filteredDocuments.length ? (safeCurrentPage - 1) * pageSize : 0;
  const pageEnd = Math.min(pageStart + pageSize, filteredDocuments.length);
  const paginatedDocuments = useMemo(
    () => filteredDocuments.slice(pageStart, pageEnd),
    [filteredDocuments, pageEnd, pageStart]
  );
  const pageOptions = useMemo(() => Array.from({ length: pageCount }, (_, index) => index + 1), [pageCount]);

  return (
    <div data-download-center className="flex flex-col gap-6">
      <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/70 p-4 shadow-sm shadow-blue-950/5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-blue-700">ศูนย์เอกสารออนไลน์</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950">ค้นหาเอกสารและแบบฟอร์ม</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ค้นหา กรองหมวด ฝ่ายงาน และชนิดไฟล์ได้จากจุดเดียว รายการด้านล่างแสดงแบบย่อเพื่อให้อ่านง่าย
            </p>
          </div>
          <div className="flex flex-wrap gap-2 xl:justify-end">
            {categoryConfig ? (
              <AdminCrudCreateButton
                user={adminUser}
                permission={categoryConfig.permission}
                moduleKey={categoryConfig.key}
                moduleLabel={categoryConfig.label}
                fields={categoryConfig.fields}
                label="เพิ่มหมวด"
                triggerSize="sm"
                adminHref={`/admin/modules/${categoryConfig.key}`}
                afterCreateHref="/documents"
              />
            ) : null}
            {crudConfig ? (
              <AdminCrudCreateButton
                user={adminUser}
                permission={crudConfig.permission}
                moduleKey={crudConfig.key}
                moduleLabel={crudConfig.label}
                fields={crudConfig.fields}
                label="เพิ่มเอกสาร"
                triggerSize="sm"
                adminHref={`/admin/modules/${crudConfig.key}`}
                afterCreateHref="/documents"
              />
            ) : null}
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_180px_180px_150px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาชื่อเอกสาร คำร้อง ฝ่ายงาน หรือคำค้น"
              className="pl-9"
            />
          </div>
          <select
            value={category}
            aria-label="หมวดเอกสาร"
            className="h-9 w-full rounded-md border border-blue-100 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-100"
            onChange={(event) => {
              setCategory(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value={allValue}>ทุกหมวดเอกสาร</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            value={department}
            aria-label="ฝ่ายงาน"
            className="h-9 w-full rounded-md border border-blue-100 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-100"
            onChange={(event) => {
              setDepartment(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value={allValue}>ทุกฝ่ายงาน</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={fileType}
            aria-label="ชนิดไฟล์"
            className="h-9 w-full rounded-md border border-blue-100 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-100"
            onChange={(event) => {
              setFileType(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value={allValue}>ทุกชนิดไฟล์</option>
            {fileTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setQuery("");
              setCategory(allValue);
              setDepartment(allValue);
              setFileType(allValue);
              setCurrentPage(1);
            }}
            className="w-full lg:w-auto"
          >
            <SlidersHorizontal data-icon="inline-start" />
            ล้างตัวกรอง
          </Button>
        </div>
      </div>

      <Card id="download-list" className="border-blue-100 shadow-sm shadow-blue-950/5">
        <CardContent className="p-0">
          <div className="hidden grid-cols-[minmax(0,1.7fr)_minmax(0,0.75fr)_100px_120px_220px] gap-4 border-b border-blue-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 lg:grid">
            <span>เอกสาร</span>
            <span>ฝ่ายงาน</span>
            <span>ไฟล์</span>
            <span className="text-center">ดาวน์โหลด</span>
            <span className="text-right">การทำงาน</span>
          </div>
          <div className="divide-y divide-blue-100">
            {filteredDocuments.length ? (
              paginatedDocuments.map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  crudConfig={crudConfig}
                  crudRow={crudRowsById.get(document.id)}
                  adminUser={adminUser}
                />
              ))
            ) : (
              <div className="px-4 py-12 text-center text-sm text-slate-500">ไม่พบเอกสารตามเงื่อนไขที่เลือก</div>
            )}
          </div>
          <div
            data-download-pagination
            className="flex flex-col gap-3 border-t border-blue-100 px-4 py-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="text-sm text-slate-600">
              แสดง {formatNumber(pageStart + (filteredDocuments.length ? 1 : 0))}-{formatNumber(pageEnd)} จาก{" "}
              {formatNumber(filteredDocuments.length)} รายการ
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-sm text-slate-600">แถวต่อหน้า</span>
                <select
                  data-testid="download-page-size-select"
                  value={String(pageSize)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                  className="h-9 w-24 rounded-md border border-blue-100 bg-white px-3 text-sm font-medium text-slate-800 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-100"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={String(option)}>
                      {formatNumber(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-sm text-slate-600">หน้า</span>
                <select
                  data-testid="download-page-select"
                  value={String(safeCurrentPage)}
                  onChange={(event) => {
                    setCurrentPage(Number(event.target.value));
                  }}
                  className="h-9 w-24 rounded-md border border-blue-100 bg-white px-3 text-sm font-medium text-slate-800 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-100"
                >
                  {pageOptions.map((page) => (
                    <option key={page} value={String(page)}>
                      {formatNumber(page)}
                    </option>
                  ))}
                </select>
                <span className="whitespace-nowrap text-sm text-slate-600">จาก {formatNumber(pageCount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage <= 1}
                  data-testid="download-prev-page"
                >
                  <ChevronLeft data-icon="inline-start" />
                  ก่อนหน้า
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  disabled={safeCurrentPage >= pageCount}
                  data-testid="download-next-page"
                >
                  ถัดไป
                  <ChevronRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
