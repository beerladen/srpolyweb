import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminLayout } from "@/components/layout";
import {
  HubSearchBar,
  HubTabs,
  FilterTabs,
  PodTemplateGrid,
  podTemplates,
} from "@/components/hub";
import { HubIconBanner } from "@/components/hub/hub-icon-banner";

export default function PodTemplatesPage() {
  return (
    <AdminLayout title="Hub">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <HubIconBanner />
          <h1 className="text-3xl font-bold">Kickstart Your Next Project</h1>
          <HubSearchBar />
        </div>

        {/* Tabs Navigation */}
        <HubTabs />

        {/* Filter and Learn More */}
        <div className="flex items-center justify-between">
          <FilterTabs />
          <Link
            href="#"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Learn more
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Templates Grid */}
        <PodTemplateGrid templates={podTemplates} />
      </div>
    </AdminLayout>
  );
}
