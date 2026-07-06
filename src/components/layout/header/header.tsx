"use client";

import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canAccess } from "@/lib/permissions";
import type { AdminUser } from "@/lib/admin-auth";
import { UserMenu } from "./user-menu";
import { BalanceDisplay } from "./balance-display";

interface HeaderProps {
  title?: string;
  currentUser: AdminUser;
  permissions?: string[];
}

export function Header({ title, currentUser, permissions = [] }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <BalanceDisplay label="ปีงบประมาณ 2569" />
        <Button asChild variant="outline">
          <Link href="/" target="_blank" rel="noreferrer">
            <Eye data-icon="inline-start" />
            ดูหน้าเว็บ
          </Link>
        </Button>
        {canAccess(permissions, "news") && (
          <Button asChild>
            <Link href="/admin/modules/news">
              <Plus data-icon="inline-start" />
              เพิ่มข่าว
            </Link>
          </Button>
        )}
        <UserMenu currentUser={currentUser} permissions={permissions} />
      </div>
    </header>
  );
}
