import { notFound } from "next/navigation";
import { DetailPage } from "@/components/public/detail-page";
import { getSiteOverview } from "@/lib/site-data";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const overview = await getSiteOverview();
  const item = overview.plans.find((entry) => String(entry.id) === id);

  if (!item) {
    notFound();
  }

  return (
    <DetailPage
      active="plans"
      backHref="/plans"
      backLabel="กลับแผนและรายงาน"
      item={item}
      permission="plans"
      module="plans"
      adminLabel="จัดการแผนนี้"
    />
  );
}
