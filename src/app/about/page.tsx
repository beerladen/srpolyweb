import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminInlineTools } from "@/components/public/admin-inline-tools";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getSiteOverview } from "@/lib/site-data";

export default async function AboutPage() {
  const [overview, adminUser] = await Promise.all([getSiteOverview(), getSignedInAdminUser()]);

  return (
    <SiteShell active="about" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading
          title="เกี่ยวกับวิทยาลัย"
          description="นำเสนอข้อมูลพื้นฐาน โครงสร้าง อำนาจหน้าที่ และทิศทางการพัฒนาของวิทยาลัยสารพัดช่างสุรินทร์"
          action={
            <AdminInlineTools
              user={adminUser}
              permission="content_pages"
              module="content_pages"
              label="จัดการหน้าเกี่ยวกับ"
              editHref="/admin/modules/content_pages?nav=about"
              showCreate={false}
            />
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["ชื่อสถานศึกษา", overview.settings.collegeName],
            ["ชื่อภาษาอังกฤษ", overview.settings.collegeNameEn],
            ["แนวทางพัฒนา", overview.settings.slogan],
          ].map(([title, body]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{body}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
