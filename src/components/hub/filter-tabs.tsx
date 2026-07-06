"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FilterTabsProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function FilterTabs({ defaultValue = "all", onChange }: FilterTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} onValueChange={onChange}>
      <TabsList className="bg-muted/50">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="official">Official</TabsTrigger>
        <TabsTrigger value="verified">Verified</TabsTrigger>
        <TabsTrigger value="community">Community</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
