import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { AdminLayout } from "@/components/layout";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { ContentPageAdminTools, ContentPageCreateButton } from "@/components/public/content-page-admin-tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminCrudModuleConfig, AdminCrudRow } from "@/lib/admin-crud-config";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { canAccess } from "@/lib/permissions";
import {
  adminModules,
  getAdminContentPages,
  getSiteOverview,
  statusLabel,
  statusVariant,
  type ContentPageItem,
  type ContentItem,
} from "@/lib/site-data";

type ModuleDisplayRow = ContentItem & {
  crudRow?: AdminCrudRow;
};

export function generateStaticParams() {
  return adminModules.map((module) => ({ module: module.key }));
}

function moduleRows(
  moduleKey: string,
  overview: Awaited<ReturnType<typeof getSiteOverview>>,
  contentPages: ContentPageItem[]
): ModuleDisplayRow[] {
  if (moduleKey === "navigation_items") {
    return overview.navigation.flatMap((item, itemIndex) => [
      {
        id: item.id ?? itemIndex + 1,
        title: item.label,
        description: item.href,
        category: "เมนูหลัก",
        href: item.href,
        status: "active",
      },
      ...(item.children?.map((child, childIndex) => ({
        id: child.id ?? (itemIndex + 1) * 100 + childIndex + 1,
        title: child.label,
        description: child.href,
        category: item.label,
        href: child.href,
        status: "active",
      })) ?? []),
    ]);
  }
  if (moduleKey === "quick_links") {
    return overview.quickLinks.map((link, index) => ({
      id: index + 1,
      title: link.label,
      description: link.href,
      category: "ลิงก์ด่วน / eService",
      href: link.href,
      status: "active",
    }));
  }
  if (moduleKey === "content_pages") {
    return contentPages.map((page) => ({
      id: page.id,
      title: page.title,
      description: page.summary,
      category: page.navKey ?? "หน้าเนื้อหา",
      href: page.href,
      status: page.status,
      metric: page.slug,
    }));
  }
  if (moduleKey === "course_groups") {
    return overview.courseGroups.map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      category: group.level,
      href: "/departments",
      status: "active",
      metric: `${group.departments.length.toLocaleString("th-TH")} แผนก`,
    }));
  }
  if (moduleKey === "news") return overview.news;
  if (moduleKey === "documents") return overview.documents;
  if (moduleKey === "procurement") return overview.procurement;
  if (moduleKey === "plans") return overview.plans;
  if (moduleKey === "services") {
    return overview.services.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.department,
      href: service.href,
      status: "active",
      metric: service.processingTime,
    }));
  }
  if (moduleKey === "ita") {
    return overview.ita.map((item) => ({
      id: item.id,
      title: `${item.code} ${item.title}`,
      description: item.category,
      category: item.category,
      href: item.href,
      status: item.status,
    }));
  }

  return [
    {
      id: 1,
      title: "เตรียมย้ายข้อมูลจากโมดูลเดิม",
      description: "โครงหน้าจอพร้อมเชื่อมตารางเดิมในเฟสถัดไป",
      category: moduleKey,
      href: "#",
      status: "review",
    },
  ];
}

function fieldDefaultValue(field: AdminCrudModuleConfig["fields"][number]) {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  return field.type === "switch" ? false : "";
}

function fallbackCrudRow(config: AdminCrudModuleConfig, row: ModuleDisplayRow): AdminCrudRow | undefined {
  if (row.id <= 0) {
    return undefined;
  }

  const values = Object.fromEntries(config.fields.map((field) => [field.name, fieldDefaultValue(field)]));

  if (config.titleField) {
    values[config.titleField] = row.title;
  }

  if (config.descriptionField) {
    values[config.descriptionField] = row.description ?? "";
  }

  if (config.categoryField) {
    values[config.categoryField] = row.category ?? "";
  }

  if (config.hrefField) {
    values[config.hrefField] = row.href;
  }

  if (config.metricField) {
    const metricField = config.fields.find((field) => field.name === config.metricField);

    if (metricField && metricField.type !== "number") {
      values[config.metricField] = row.metric ?? "";
    }
  }

  if (config.statusField) {
    const statusField = config.fields.find((field) => field.name === config.statusField);
    values[config.statusField] = statusField?.type === "switch" ? row.status === "active" || row.status === "published" : row.status ?? "";
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    href: row.href,
    status: row.status,
    metric: row.metric,
    values,
  };
}

export default async function AdminModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleKey } = await params;
  const currentModule = adminModules.find((item) => item.key === moduleKey);

  if (!currentModule) {
    notFound();
  }

  const overview = await getSiteOverview();
  const contentPages = moduleKey === "content_pages" ? await getAdminContentPages() : overview.contentPages;
  const currentUser = await getCurrentAdminUser();
  const crudConfig = moduleKey === "content_pages" ? null : await getAdminCrudAvailableConfig(moduleKey);

  if (!canAccess(currentUser.effectivePermissions, currentModule.permission)) {
    return (
      <AdminLayout title={currentModule.label}>
        <Card>
          <CardHeader>
            <CardTitle>ไม่มีสิทธิ์จัดการเมนูนี้</CardTitle>
            <CardDescription>
              บัญชี {currentUser.email} อยู่ในบทบาท {currentUser.roleName} จึงไม่เห็นหรือจัดการโมดูล {currentModule.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            หากต้องการให้ผู้ใช้นี้จัดการส่วนนี้ ให้เพิ่มสิทธิ์ {currentModule.permission} ในเมนูผู้ใช้งาน / สิทธิ์
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  const fallbackRows = moduleRows(moduleKey, overview, contentPages);
  const adminListCrudConfig =
    crudConfig && crudConfig.adminOrderBy ? { ...crudConfig, orderBy: crudConfig.adminOrderBy } : crudConfig;
  const crudRows = adminListCrudConfig ? await getAdminCrudRows(adminListCrudConfig) : null;
  const rows: ModuleDisplayRow[] =
    crudRows === null
      ? fallbackRows.map((row) => ({ ...row, crudRow: crudConfig ? fallbackCrudRow(crudConfig, row) : undefined }))
      : crudRows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category,
          href: row.href,
          status: row.status,
          metric: row.metric,
          crudRow: row,
        }));

  return (
    <AdminLayout title={currentModule.label}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-normal">{currentModule.label}</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{currentModule.description}</p>
          </div>
          {moduleKey === "content_pages" ? (
            <ContentPageCreateButton user={currentUser} />
          ) : crudConfig ? (
            <AdminCrudCreateButton
              user={currentUser}
              permission={crudConfig.permission}
              moduleKey={crudConfig.key}
              moduleLabel={crudConfig.label}
              fields={crudConfig.fields}
              adminHref={`/admin/modules/${crudConfig.key}`}
              afterDeleteHref={`/admin/modules/${crudConfig.key}`}
            />
          ) : (
            <Button>
              <Plus data-icon="inline-start" />
              เพิ่มรายการ
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการข้อมูล</CardTitle>
            <CardDescription>ตารางเดิม: {currentModule.table}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อรายการ</TableHead>
                  <TableHead>หมวด/หน่วยงาน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>หมายเหตุ</TableHead>
                  <TableHead className="text-right">การทำงาน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? rows.map((row) => {
                  const contentPage =
                    moduleKey === "content_pages"
                      ? contentPages.find((page) => page.id === row.id)
                      : undefined;

                  return (
                    <TableRow key={`${row.id}-${row.title}`}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>{row.category ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                      </TableCell>
                      <TableCell>{row.metric ?? row.description ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {contentPage ? (
                            <ContentPageAdminTools
                              user={currentUser}
                              page={contentPage}
                              label="จัดการ"
                              afterDeleteHref="/admin/modules/content_pages"
                            />
                          ) : null}
                          {crudConfig && row.crudRow ? (
                            <AdminCrudTools
                              user={currentUser}
                              permission={crudConfig.permission}
                              moduleKey={crudConfig.key}
                              moduleLabel={crudConfig.label}
                              fields={crudConfig.fields}
                              row={row.crudRow}
                              label="จัดการ"
                              adminHref={`/admin/modules/${crudConfig.key}`}
                              afterDeleteHref={`/admin/modules/${crudConfig.key}`}
                            />
                          ) : null}
                          <Button asChild variant="ghost" size="sm">
                            <Link href={row.href}>
                              เปิด
                              <ArrowRight data-icon="inline-end" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      ยังไม่มีรายการในเมนูนี้
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
