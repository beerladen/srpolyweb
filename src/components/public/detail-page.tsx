import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCrudTools } from "@/components/public/admin-crud-tools";
import { AdminInlineTools } from "@/components/public/admin-inline-tools";
import { NewsMediaSection } from "@/components/public/news-media-section";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRow } from "@/lib/admin-crud-server";
import { withBasePath } from "@/lib/base-path";
import { getSiteOverview, statusLabel, statusVariant, type ContentItem } from "@/lib/site-data";

function displayDate(value?: string | Date): string {
  if (!value) {
    return "";
  }

  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function coverImageClass(item: ContentItem): string {
  return item.coverDisplayMode === "contain"
    ? "aspect-video min-h-72 bg-contain bg-center bg-no-repeat bg-slate-50"
    : "min-h-72 bg-cover bg-center";
}

type DetailPageProps = {
  active: string;
  backHref: string;
  backLabel: string;
  item: ContentItem;
  permission?: string;
  module?: string;
  adminLabel?: string;
};

export async function DetailPage({ active, backHref, backLabel, item, permission, module, adminLabel }: DetailPageProps) {
  const [overview, adminUser, crudConfig] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    module ? getAdminCrudAvailableConfig(module) : Promise.resolve(null),
  ]);
  const crudRow = crudConfig ? await getAdminCrudRow(crudConfig, item.id) : null;

  return (
    <SiteShell active={active} settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 md:px-6">
        <Button asChild variant="ghost" className="w-fit">
          <Link href={backHref}>
            <ArrowLeft data-icon="inline-start" />
            {backLabel}
          </Link>
        </Button>
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-wrap gap-2">
                {item.category ? <Badge variant="secondary">{item.category}</Badge> : null}
                {item.status ? <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge> : null}
              </div>
              {permission && module ? (
                crudConfig && crudRow ? (
                  <AdminCrudTools
                    user={adminUser}
                    permission={crudConfig.permission}
                    moduleKey={crudConfig.key}
                    moduleLabel={crudConfig.label}
                    fields={crudConfig.fields}
                    row={crudRow}
                    label={adminLabel ?? "จัดการรายการนี้"}
                    adminHref={`/admin/modules/${crudConfig.key}`}
                    afterDeleteHref={`/admin/modules/${crudConfig.key}`}
                  />
                ) : (
                  <AdminInlineTools
                    user={adminUser}
                    permission={permission}
                    module={module}
                    label={adminLabel}
                    showCreate={false}
                  />
                )
              ) : null}
            </div>
            <CardTitle className="text-2xl leading-9">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm leading-7 text-muted-foreground">
            {item.image ? (
              <div
                className={`${coverImageClass(item)} rounded-lg border`}
                style={{ backgroundImage: `url("${withBasePath(item.image)}")` }}
                aria-label={item.title}
              />
            ) : null}
            {item.description ? <p className="text-base leading-7 text-slate-700">{item.description}</p> : null}
            {item.content ? (
              <div
                className="space-y-4 text-sm leading-7 text-slate-700 md:text-base [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-7"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            ) : !item.description ? (
              <p>รายละเอียดนี้จะเชื่อมจากฐานข้อมูลเดิมในขั้นตอนย้ายเนื้อหาเต็มรูปแบบ</p>
            ) : null}
            <NewsMediaSection
              galleryImages={item.galleryImages}
              attachments={item.attachments}
              externalLinks={item.externalLinks}
            />
            {item.metric ? <p>ข้อมูลประกอบ: {item.metric}</p> : null}
            {item.date ? <p>วันที่เผยแพร่: {displayDate(item.date)}</p> : null}
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
