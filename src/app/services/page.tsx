import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCrudCreateButton, AdminCrudTools } from "@/components/public/admin-crud-tools";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { getSiteOverview } from "@/lib/site-data";

const serviceCardStyles = [
  "border-blue-100 bg-blue-50/80 shadow-blue-950/5",
  "border-cyan-100 bg-cyan-50/80 shadow-cyan-950/5",
  "border-amber-100 bg-amber-50/80 shadow-amber-950/5",
  "border-emerald-100 bg-emerald-50/80 shadow-emerald-950/5",
];

function isExternalLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export default async function ServicesPage() {
  const [overview, adminUser, serviceConfig, quickLinkConfig] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("services"),
    getAdminCrudAvailableConfig("quick_links"),
  ]);
  const [serviceRows, quickLinkRows] = await Promise.all([
    serviceConfig ? getAdminCrudRows(serviceConfig) : Promise.resolve(null),
    quickLinkConfig ? getAdminCrudRows(quickLinkConfig) : Promise.resolve(null),
  ]);
  const serviceRowsById = new Map((serviceRows ?? []).map((row) => [row.id, row]));
  const quickLinkRowsByKey = new Map((quickLinkRows ?? []).map((row) => [String(row.values.item_key ?? ""), row]));

  return (
    <SiteShell active="services" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="bg-gradient-to-b from-white to-sky-50/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
          <SectionHeading
            title="บริการออนไลน์"
            description="รวมบริการที่ใช้บ่อย ขั้นตอน เอกสารที่เกี่ยวข้อง และหน่วยงานรับผิดชอบ"
            action={
              <div className="flex flex-wrap gap-2">
                {quickLinkConfig ? (
                  <AdminCrudCreateButton
                    user={adminUser}
                    permission={quickLinkConfig.permission}
                    moduleKey={quickLinkConfig.key}
                    moduleLabel={quickLinkConfig.label}
                    fields={quickLinkConfig.fields}
                    label="เพิ่มลิงก์ด่วน"
                  />
                ) : null}
                {serviceConfig ? (
                  <AdminCrudCreateButton
                    user={adminUser}
                    permission={serviceConfig.permission}
                    moduleKey={serviceConfig.key}
                    moduleLabel={serviceConfig.label}
                    fields={serviceConfig.fields}
                    label="เพิ่มบริการ"
                  />
                ) : null}
              </div>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {overview.quickLinks.map((link) => {
              const quickLinkRow = quickLinkRowsByKey.get(link.itemKey);

              return (
                <div
                  key={link.itemKey}
                  className="flex min-h-24 flex-col justify-between gap-3 rounded-md border border-blue-100 bg-white p-4 shadow-sm shadow-blue-950/5"
                >
                  <Link
                    href={link.href}
                    target={isExternalLink(link.href) ? "_blank" : undefined}
                    rel={isExternalLink(link.href) ? "noreferrer" : undefined}
                    className="text-sm font-semibold text-blue-950 transition-colors hover:text-blue-700"
                  >
                    {link.label}
                  </Link>
                  {quickLinkConfig && quickLinkRow ? (
                    <AdminCrudTools
                      user={adminUser}
                      permission={quickLinkConfig.permission}
                      moduleKey={quickLinkConfig.key}
                      moduleLabel={quickLinkConfig.label}
                      fields={quickLinkConfig.fields}
                      row={quickLinkRow}
                      label="จัดการ"
                      triggerSize="sm"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {overview.services.map((service, index) => {
              const serviceRow = serviceRowsById.get(service.id);

              return (
                <Card
                  key={service.id}
                  className={`overflow-hidden border shadow-sm ${serviceCardStyles[index % serviceCardStyles.length]}`}
                >
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="h-1.5 w-16 rounded-full bg-primary" />
                      {serviceConfig && serviceRow ? (
                        <AdminCrudTools
                          user={adminUser}
                          permission={serviceConfig.permission}
                          moduleKey={serviceConfig.key}
                          moduleLabel={serviceConfig.label}
                          fields={serviceConfig.fields}
                          row={serviceRow}
                          label="จัดการ"
                          triggerSize="sm"
                        />
                      ) : null}
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-sm leading-6 text-muted-foreground">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{service.department}</Badge>
                      <Badge variant="outline">{service.processingTime}</Badge>
                    </div>
                    {service.href && service.href !== "#" ? (
                      <Button asChild>
                        <Link
                          href={service.href}
                          target={isExternalLink(service.href) ? "_blank" : undefined}
                          rel={isExternalLink(service.href) ? "noreferrer" : undefined}
                        >
                          เปิดบริการ
                          <ArrowRight data-icon="inline-end" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="border-blue-200 bg-white/70">
                        รอเพิ่มลิงก์
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
