import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSiteOverview } from "@/lib/site-data";

export default async function ComplaintPage() {
  const overview = await getSiteOverview();

  return (
    <SiteShell active="complaint" settings={overview.settings} navigation={overview.navigation}>
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading title="ส่งเรื่องร้องเรียน / ข้อเสนอแนะ" description="ฟอร์มนี้เป็นหน้าตาใหม่สำหรับย้ายจาก complaint.php โดยยังคงช่องข้อมูลเดิม" />
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดเรื่อง</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="complaint_type">ประเภทเรื่อง</FieldLabel>
                  <Input id="complaint_type" name="complaint_type" placeholder="ข้อเสนอแนะ / ร้องเรียนทั่วไป / แจ้งเบาะแสทุจริต" />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="name">ชื่อผู้แจ้ง</FieldLabel>
                    <Input id="name" name="name" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="contact">ช่องทางติดต่อ</FieldLabel>
                    <Input id="contact" name="contact" />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="subject">หัวข้อ</FieldLabel>
                  <Input id="subject" name="subject" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="detail">รายละเอียด</FieldLabel>
                  <Textarea id="detail" name="detail" className="min-h-32" />
                </Field>
              </FieldGroup>
              <Button type="button">
                <Send data-icon="inline-start" />
                ส่งเรื่อง
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
