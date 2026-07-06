"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { value: "serverless-repos", label: "Serverless Repos", href: "/hub/serverless-repos" },
  { value: "pod-templates", label: "Pod Templates", href: "/hub/pod-templates" },
  { value: "public-endpoints", label: "Public Endpoints", href: "/hub/public-endpoints" },
];

export function HubTabs() {
  const pathname = usePathname();
  const currentTab = tabs.find((tab) => pathname.includes(tab.value))?.value || "pod-templates";

  return (
    <Tabs value={currentTab} className="w-full">
      <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="relative px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            asChild
          >
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
