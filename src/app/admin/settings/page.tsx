import { Palette, Save } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { executeSqlResult } from "@/lib/db";
import { getSiteOverview } from "@/lib/site-data";
import { getThemePreset, isThemePresetId, siteThemePresets } from "@/lib/site-theme";

async function saveSiteSetting(key: string, value: string) {
  await executeSqlResult(
    `INSERT INTO site_settings (setting_key, setting_value, updated_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
    [key, value]
  );
}

async function saveWebsiteSettings(formData: FormData) {
  "use server";

  const themePreset = formData.get("theme_preset");
  const normalizedThemePreset = isThemePresetId(themePreset) ? themePreset : "srpoly-blue";
  const settings = [
    ["college_name", formData.get("college_name")?.toString().trim() ?? ""],
    ["college_name_en", formData.get("college_name_en")?.toString().trim() ?? ""],
    ["slogan", formData.get("slogan")?.toString().trim() ?? ""],
    ["contact_email", formData.get("contact_email")?.toString().trim() ?? ""],
    ["contact_phone", formData.get("contact_phone")?.toString().trim() ?? ""],
    ["contact_fax", formData.get("contact_fax")?.toString().trim() ?? ""],
    ["address", formData.get("address")?.toString().trim() ?? ""],
    ["theme_preset", normalizedThemePreset],
  ] as const;

  await Promise.all(settings.map(([key, value]) => saveSiteSetting(key, value)));

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const [overview, resolvedSearchParams] = await Promise.all([getSiteOverview(), searchParams]);
  const currentTheme = getThemePreset(overview.settings.themePreset);
  const isSaved = resolvedSearchParams?.saved === "1";

  return (
    <AdminLayout title="ตั้งค่าเว็บไซต์">
      <form action={saveWebsiteSettings} className="flex max-w-6xl flex-col gap-6">
        {isSaved ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลพื้นฐานเว็บไซต์</CardTitle>
            <CardDescription>ข้อมูลนี้ใช้กับส่วนหัว หน้าแรก footer และช่องทางติดต่อของเว็บไซต์</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="college_name">ชื่อวิทยาลัย</FieldLabel>
                <Input id="college_name" name="college_name" defaultValue={overview.settings.collegeName} />
              </Field>
              <Field>
                <FieldLabel htmlFor="college_name_en">ชื่อภาษาอังกฤษ</FieldLabel>
                <Input id="college_name_en" name="college_name_en" defaultValue={overview.settings.collegeNameEn} />
              </Field>
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="slogan">คำอธิบายสั้น / สโลแกน</FieldLabel>
                <Input id="slogan" name="slogan" defaultValue={overview.settings.slogan} />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact_email">อีเมลติดต่อ</FieldLabel>
                <Input id="contact_email" name="contact_email" defaultValue={overview.settings.contactEmail} />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact_phone">โทรศัพท์</FieldLabel>
                <Input id="contact_phone" name="contact_phone" defaultValue={overview.settings.contactPhone} />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact_fax">โทรสาร</FieldLabel>
                <Input id="contact_fax" name="contact_fax" defaultValue={overview.settings.contactFax} />
              </Field>
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="address">ที่อยู่</FieldLabel>
                <Textarea id="address" name="address" defaultValue={overview.settings.address} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Palette className="size-5" />
              </span>
              <div>
                <CardTitle>พรีเซตสีเว็บไซต์</CardTitle>
                <CardDescription className="mt-1">
                  เลือกโทนสีหลักของเว็บไซต์ มีทั้งแบบสว่างและ Dark Light สำหรับใช้งานพื้นหลังเข้ม
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel>ชุดสีที่ใช้งาน</FieldLabel>
              <FieldDescription>เมื่อบันทึกแล้ว สีหลักของปุ่ม เมนู แถบด้านข้าง พื้นหลัง และการ์ดระบบจะปรับตามพรีเซต</FieldDescription>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {siteThemePresets.map((preset) => (
                  <label key={preset.id} className="group cursor-pointer">
                    <input
                      type="radio"
                      name="theme_preset"
                      value={preset.id}
                      defaultChecked={preset.id === currentTheme.id}
                      className="peer sr-only"
                    />
                    <span className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-all peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary/20 group-hover:border-primary/60">
                      <span className="flex items-center justify-between gap-3">
                        <span>
                          <strong className="block text-sm text-foreground">{preset.name}</strong>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {preset.mode === "dark" ? "โหมดเข้ม" : "โหมดสว่าง"}
                          </span>
                        </span>
                        <span className="rounded-full border border-border px-2 py-1 text-xs font-semibold text-muted-foreground peer-checked:text-primary">
                          {preset.id === currentTheme.id ? "ใช้อยู่" : "เลือก"}
                        </span>
                      </span>
                      <span
                        className="grid h-20 overflow-hidden rounded-md border border-border p-2"
                        style={{ backgroundColor: preset.preview.background }}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="size-7 rounded"
                            style={{ backgroundColor: preset.preview.primary }}
                          />
                          <span className="h-2 w-20 rounded-full" style={{ backgroundColor: preset.preview.surface }} />
                        </span>
                        <span className="mt-auto grid grid-cols-[1fr_40px] gap-2">
                          <span className="h-8 rounded" style={{ backgroundColor: preset.preview.surface }} />
                          <span className="h-8 rounded" style={{ backgroundColor: preset.preview.accent }} />
                        </span>
                      </span>
                      <span className="text-xs leading-5 text-muted-foreground">{preset.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 z-10 flex justify-end border-t bg-background/90 py-4 backdrop-blur">
          <Button type="submit">
            <Save data-icon="inline-start" />
            บันทึกการตั้งค่า
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
