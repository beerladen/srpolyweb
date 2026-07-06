"use client";

import { useState } from "react";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { bottomNavItems, sidebarData } from "./sidebar-data";
import { NavItem } from "./nav-item";
import { NavSection } from "./nav-section";
import { Logo } from "./logo";

interface SidebarProps {
  className?: string;
  permissions?: string[];
}

export function Sidebar({ className, permissions = [] }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const visibleSections = sidebarData
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccess(permissions, item.permission)),
    }))
    .filter((section) => section.items.length > 0);
  const visibleBottomItems = bottomNavItems.filter((item) => canAccess(permissions, item.permission));

  return (
    <aside
      className={cn(
        "flex h-screen flex-col overflow-hidden border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-14" : "w-64",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b",
          collapsed ? "justify-center px-2" : "justify-between px-6"
        )}
      >
        {!collapsed && <Logo collapsed={collapsed} />}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft /> : <PanelLeftClose />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={cn("py-4", collapsed ? "px-2" : "px-3")}>
          <div className="flex flex-col gap-2">
            {visibleSections.map((section, index) => (
              <NavSection
                key={index}
                section={section}
                collapsed={collapsed}
                defaultOpen
              />
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <nav className="flex flex-col gap-1">
              {visibleBottomItems.map((item) => (
                <NavItem key={item.href} item={item} collapsed={collapsed} />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
