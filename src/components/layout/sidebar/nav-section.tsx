"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavSection as NavSectionType } from "./sidebar-data";
import { NavItem } from "./nav-item";

interface NavSectionProps {
  section: NavSectionType;
  collapsed?: boolean;
  defaultOpen?: boolean;
}

export function NavSection({ section, collapsed, defaultOpen = true }: NavSectionProps) {
  if (!section.title || collapsed) {
    return (
      <nav className="flex flex-col gap-1">
        {section.items.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>
    );
  }

  return (
    <details className="group" open={defaultOpen}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors",
          "hover:bg-accent hover:text-accent-foreground [&::-webkit-details-marker]:hidden"
        )}
      >
        <span>{section.title}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <nav className="flex flex-col gap-1 pb-0 pt-1">
        {section.items.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </details>
  );
}
