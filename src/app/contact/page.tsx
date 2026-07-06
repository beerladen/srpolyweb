import { Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminInlineTools } from "@/components/public/admin-inline-tools";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getSiteOverview } from "@/lib/site-data";

export default async function ContactPage() {
  const [overview, adminUser] = await Promise.all([getSiteOverview(), getSignedInAdminUser()]);
  const contacts = [
    { label: "โทรศัพท์", value: overview.settings.contactPhone, icon: Phone },
    { label: "โทรสาร", value: overview.settings.contactFax, icon: Phone },
    { label: "อีเมล", value: overview.settings.contactEmail, icon: Mail },
    { label: "ที่อยู่", value: overview.settings.address, icon: MapPin },
  ];

  return (
    <SiteShell active="contact" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading
          title="ติดต่อเรา"
          description="ข้อมูลติดต่อของวิทยาลัยสารพัดช่างสุรินทร์"
          action={
            <AdminInlineTools
              user={adminUser}
              permission="content_pages"
              module="content_pages"
              label="จัดการหน้าติดต่อ"
              editHref="/admin/modules/content_pages?nav=contact"
              showCreate={false}
            />
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="size-5" />
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">{item.value}</CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
