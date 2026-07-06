import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCrudTools } from "@/components/public/admin-crud-tools";
import { SiteShell } from "@/components/public/site-shell";
import { SectionHeading } from "@/components/public/section-heading";
import type { AdminUser } from "@/lib/admin-auth";
import type { AdminCrudModuleConfig, AdminCrudRow } from "@/lib/admin-crud-config";
import { getSiteOverview, statusLabel, statusVariant, type ContentItem } from "@/lib/site-data";

function displayDate(value?: string | Date): string {
  if (!value) {
    return "ข้อมูลเผยแพร่";
  }

  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

type ListingPageProps = {
  active: string;
  title: string;
  description: string;
  items: ContentItem[];
};

export function ContentList({ items }: { items: ContentItem[] }) {
  return <CrudContentList items={items} />;
}

type CrudContentListProps = {
  items: ContentItem[];
  adminUser?: AdminUser | null;
  crudConfig?: AdminCrudModuleConfig | null;
  crudRows?: AdminCrudRow[] | null;
  adminLabel?: string;
};

export function CrudContentList({
  items,
  adminUser,
  crudConfig,
  crudRows,
  adminLabel = "จัดการ",
}: CrudContentListProps) {
  const crudRowsById = new Map((crudRows ?? []).map((row) => [row.id, row]));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => {
        const crudRow = crudConfig ? crudRowsById.get(item.id) : undefined;

        return (
          <Card key={`${item.href}-${item.id}`} className="border-blue-100 shadow-sm shadow-blue-950/5">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {item.category ? <Badge variant="secondary">{item.category}</Badge> : null}
                  {item.status ? <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge> : null}
                </div>
                {crudConfig && crudRow ? (
                  <AdminCrudTools
                    user={adminUser}
                    permission={crudConfig.permission}
                    moduleKey={crudConfig.key}
                    moduleLabel={crudConfig.label}
                    fields={crudConfig.fields}
                    row={crudRow}
                    label={adminLabel}
                    triggerSize="sm"
                    adminHref={`/admin/modules/${crudConfig.key}`}
                    afterDeleteHref={`/admin/modules/${crudConfig.key}`}
                  />
                ) : null}
              </div>
              <CardTitle className="text-lg leading-7">
                <Link href={item.href} className="hover:underline">
                  {item.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {item.description ? (
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {displayDate(item.date)}
                </span>
                {item.metric ? <span>{item.metric}</span> : null}
              </div>
              <Button asChild variant="outline" className="border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100">
                <Link href={item.href}>
                  อ่านรายละเอียด
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export async function ListingPage({ active, title, description, items }: ListingPageProps) {
  const overview = await getSiteOverview();

  return (
    <SiteShell active={active} settings={overview.settings} navigation={overview.navigation}>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading title={title} description={description} />
        <ContentList items={items} />
      </section>
    </SiteShell>
  );
}
