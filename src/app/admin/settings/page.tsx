import { AdminLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getSiteOverview } from "@/lib/site-data";

export default async function SettingsPage() {
  const overview = await getSiteOverview();

  return (
    <AdminLayout title="ตั้งค่าเว็บไซต์">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลพื้นฐานเว็บไซต์</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex max-w-3xl flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="college_name">ชื่อวิทยาลัย</FieldLabel>
                <Input id="college_name" defaultValue={overview.settings.collegeName} />
              </Field>
              <Field>
                <FieldLabel htmlFor="college_name_en">ชื่อภาษาอังกฤษ</FieldLabel>
                <Input id="college_name_en" defaultValue={overview.settings.collegeNameEn} />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact_email">อีเมลติดต่อ</FieldLabel>
                <Input id="contact_email" defaultValue={overview.settings.contactEmail} />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact_phone">โทรศัพท์</FieldLabel>
                <Input id="contact_phone" defaultValue={overview.settings.contactPhone} />
              </Field>
            </FieldGroup>
            <Button type="button">บันทึกการตั้งค่า</Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
