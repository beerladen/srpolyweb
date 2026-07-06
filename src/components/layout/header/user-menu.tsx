"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { canAccess } from "@/lib/permissions";
import type { AdminUser } from "@/lib/admin-auth";
import { apiPath, withBasePath } from "@/lib/base-path";

interface UserMenuProps {
  currentUser: AdminUser;
  permissions?: string[];
}

export function UserMenu({ currentUser, permissions = [] }: UserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(apiPath("/api/admin/session"), { method: "DELETE" });
    window.location.assign(withBasePath("/signin"));
  };
  const fallback = currentUser.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full"
          aria-label="User menu"
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-muted">{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <span className="block font-medium">{currentUser.name}</span>
          <span className="block text-xs font-normal text-muted-foreground">{currentUser.roleName}</span>
          <span className="block text-xs font-normal text-muted-foreground">{currentUser.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {canAccess(permissions, "users") && (
            <DropdownMenuItem onClick={() => router.push("/admin/users")}>
              <UserRound />
              <span>ผู้ใช้งาน / สิทธิ์</span>
            </DropdownMenuItem>
          )}
          {canAccess(permissions, "site_blocks") && (
            <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
              <Settings />
              <span>ตั้งค่าเว็บไซต์</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          <span>ออกจากระบบ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
