import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSiteOverview } from "@/lib/site-data";

export default async function ComplaintStatusPage() {
  const overview = await getSiteOverview();

  return (
    <SiteShell active="complaint" settings={overview.settings} navigation={overview.navigation}>
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading title="ติดตามสถานะเรื่องร้องเรียน" description="กรอกรหัสติดตามที่ได้รับหลังส่งเรื่อง เช่น SPC-20260617-DEMO01" />
        <Card>
          <CardHeader>
            <CardTitle>ค้นหาสถานะ</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4 md:flex-row md:items-end">
              <FieldGroup className="flex-1">
                <Field>
                  <FieldLabel htmlFor="tracking_code">รหัสติดตาม</FieldLabel>
                  <Input id="tracking_code" name="tracking_code" placeholder="SPC-20260617-DEMO01" />
                </Field>
              </FieldGroup>
              <Button type="button">
                <Search data-icon="inline-start" />
                ตรวจสอบ
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
