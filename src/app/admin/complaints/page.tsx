import { AdminLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ComplaintsPage() {
  return (
    <AdminLayout title="เรื่องร้องเรียน">
      <Card>
        <CardHeader>
          <CardTitle>รายการเรื่องร้องเรียน / ข้อเสนอแนะ</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสติดตาม</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>หัวข้อ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>ผู้รับผิดชอบ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">SPC-20260617-DEMO01</TableCell>
                <TableCell>ข้อเสนอแนะ</TableCell>
                <TableCell>เสนอแนะการปรับปรุงช่องทางบริการออนไลน์</TableCell>
                <TableCell><Badge variant="secondary">กำลังดำเนินการ</Badge></TableCell>
                <TableCell>งานเทคโนโลยีสารสนเทศ</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
