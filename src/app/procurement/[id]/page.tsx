import { notFound } from "next/navigation";
import { DetailPage } from "@/components/public/detail-page";
import { getSiteOverview } from "@/lib/site-data";

export default async function ProcurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const overview = await getSiteOverview();
  const item = overview.procurement.find((entry) => String(entry.id) === id);

  if (!item) {
    notFound();
  }

  return (
    <DetailPage
      active="procurement"
      backHref="/procurement"
      backLabel="กลับจัดซื้อจัดจ้าง"
      item={item}
      permission="procurement"
      module="procurement"
      adminLabel="จัดการรายการนี้"
    />
  );
}
