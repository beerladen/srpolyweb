import { Link2 } from "lucide-react";
import { AdminLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FacebookPage() {
  return (
    <AdminLayout title="เชื่อมต่อ Facebook">
      <Card>
        <CardHeader>
          <CardTitle>Facebook Sync</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            หน้านี้เตรียมไว้สำหรับย้ายความสามารถจาก `admin/facebook.php` เพื่อซิงก์โพสต์ประชาสัมพันธ์เข้าตารางข่าวของเว็บไซต์
          </p>
          <Button>
            <Link2 data-icon="inline-start" />
            ตั้งค่าการเชื่อมต่อ
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
