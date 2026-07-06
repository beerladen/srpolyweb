import { AdminCrudCreateButton } from "@/components/public/admin-crud-tools";
import { CrudContentList } from "@/components/public/listing-page";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSignedInAdminUser } from "@/lib/admin-auth";
import { getAdminCrudAvailableConfig, getAdminCrudRows } from "@/lib/admin-crud-server";
import { getSiteOverview } from "@/lib/site-data";

export default async function PlansPage() {
  const [overview, adminUser, crudConfig] = await Promise.all([
    getSiteOverview(),
    getSignedInAdminUser(),
    getAdminCrudAvailableConfig("plans"),
  ]);
  const crudRows = crudConfig ? await getAdminCrudRows(crudConfig) : null;

  return (
    <SiteShell active="plans" settings={overview.settings} navigation={overview.navigation} adminUser={adminUser}>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading
          title="แผนและรายงาน"
          description="แผนพัฒนาสถานศึกษา แผนปฏิบัติราชการ SAR และรายงานสำคัญของวิทยาลัย"
          action={
            crudConfig ? (
              <AdminCrudCreateButton
                user={adminUser}
                permission={crudConfig.permission}
                moduleKey={crudConfig.key}
                moduleLabel={crudConfig.label}
                fields={crudConfig.fields}
                label="เพิ่มแผน"
              />
            ) : null
          }
        />
        <CrudContentList
          items={overview.plans}
          adminUser={adminUser}
          crudConfig={crudConfig}
          crudRows={crudRows}
          adminLabel="จัดการแผน"
        />
      </section>
    </SiteShell>
  );
}
