import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { getSiteOverview } from "@/lib/site-data";

export default async function SearchPage() {
  const overview = await getSiteOverview();

  return (
    <SiteShell active="search" settings={overview.settings} navigation={overview.navigation}>
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:px-6">
        <SectionHeading title="ค้นหา" description="ค้นหาข่าว เอกสาร บริการ และข้อมูลสาธารณะของวิทยาลัย" />
        <Card>
          <CardHeader>
            <CardTitle>คำค้นหา</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4 md:flex-row">
              <FieldGroup className="flex-1">
                <Field>
                  <FieldLabel htmlFor="q" className="sr-only">คำค้นหา</FieldLabel>
                  <Input id="q" name="q" placeholder="พิมพ์คำค้นหา..." />
                </Field>
              </FieldGroup>
              <Button type="button">
                <Search data-icon="inline-start" />
                ค้นหา
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
