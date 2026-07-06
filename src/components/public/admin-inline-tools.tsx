"use client";

import Link from "next/link";
import { ExternalLink, LayoutDashboard, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AdminUser } from "@/lib/admin-auth";
import { canAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type AdminInlineToolsProps = {
  user?: AdminUser | null;
  permission: string;
  module: string;
  label?: string;
  description?: string;
  editHref?: string;
  manageHref?: string;
  createHref?: string;
  showCreate?: boolean;
  className?: string;
};

export function AdminInlineTools({
  user,
  permission,
  module,
  label = "จัดการส่วนนี้",
  description = "เลือกวิธีจัดการข้อมูลส่วนนี้ได้ทั้งจากตำแหน่งที่กำลังดูอยู่ หรือเปิดเข้าไปทำต่อในหน้าแอดมิน",
  editHref,
  manageHref,
  createHref,
  showCreate = true,
  className,
}: AdminInlineToolsProps) {
  if (!user || !canAccess(user.effectivePermissions, permission)) {
    return null;
  }

  const adminHref = manageHref ?? `/admin/modules/${module}`;
  const inlineHref = editHref ?? adminHref;
  const addHref = createHref ?? adminHref;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Pencil data-icon="inline-start" />
            {label}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href={inlineHref}>
                <Pencil data-icon="inline-start" />
                แก้ไขจากตำแหน่งนี้
              </Link>
            </Button>
            {showCreate ? (
              <Button asChild variant="outline" className="justify-start">
                <Link href={addHref}>
                  <Plus data-icon="inline-start" />
                  เพิ่มรายการ
                </Link>
              </Button>
            ) : null}
          </div>
          <DialogFooter>
            <Button asChild>
              <Link href={adminHref}>
                เปิดในแอดมิน
                <ExternalLink data-icon="inline-end" />
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminDashboardLink({ user, className }: { user?: AdminUser | null; className?: string }) {
  if (!user) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="sm" className={className}>
      <Link href="/admin">
        <LayoutDashboard data-icon="inline-start" />
        หลังบ้าน
      </Link>
    </Button>
  );
}
