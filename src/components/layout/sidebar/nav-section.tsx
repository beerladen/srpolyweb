"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <Accordion type="multiple" defaultValue={defaultOpen ? [section.title] : []}>
      <AccordionItem value={section.title} className="border-none">
        <AccordionTrigger className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:no-underline">
          <span>{section.title}</span>
        </AccordionTrigger>
        <AccordionContent className="pb-0 pt-1">
          <nav className="flex flex-col gap-1">
            {section.items.map((item) => (
              <NavItem key={item.href} item={item} collapsed={collapsed} />
            ))}
          </nav>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
