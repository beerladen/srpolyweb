import { AdminCrudCreateButton } from "@/components/public/admin-crud-tools";
import { CrudContentList } from "@/components/public/listing-page";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { getSiteOverview } from "@/lib/site-data";

export default async function NewsPage() {
  const [overview, adminUser, crudConfig, categoryConfig] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("news"),
    getAdminCrudAvailableConfig("news_categories"),
  ]);
  const crudRows = crudConfig ? await getAdminCrudRows(crudConfig) : null;

  return (
    <SiteShell active="news" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading
          title="ข่าวสารประชาสัมพันธ์"
          description="ข่าวรับสมัคร กิจกรรม ความร่วมมือ และประกาศข่าวสารของวิทยาลัย"
          action={
            <div className="flex flex-wrap gap-2">
              {categoryConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={categoryConfig.permission}
                  moduleKey={categoryConfig.key}
                  moduleLabel={categoryConfig.label}
                  fields={categoryConfig.fields}
                  afterCreateHref="/news"
                  label="เพิ่มหมวดข่าว"
                />
              ) : null}
              {crudConfig ? (
                <AdminCrudCreateButton
                  user={adminUser}
                  permission={crudConfig.permission}
                  moduleKey={crudConfig.key}
                  moduleLabel={crudConfig.label}
                  fields={crudConfig.fields}
                  afterCreateHref="/news"
                  label="เพิ่มข่าว"
                />
              ) : null}
            </div>
          }
        />
        <CrudContentList
          items={overview.news}
          adminUser={adminUser}
          crudConfig={crudConfig}
          crudRows={crudRows}
          adminLabel="จัดการข่าว"
        />
      </section>
    </SiteShell>
  );
}
