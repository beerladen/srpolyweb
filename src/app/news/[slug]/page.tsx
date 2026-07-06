import { notFound } from "next/navigation";
import { DetailPage } from "@/components/public/detail-page";
import { getNewsItem } from "@/lib/site-data";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getNewsItem(slug);

  if (!item) {
    notFound();
  }

  return (
    <DetailPage
      active="news"
      backHref="/news"
      backLabel="กลับข่าวสาร"
      item={item}
      permission="news"
      module="news"
      adminLabel="จัดการข่าวนี้"
    />
  );
}
