"use client";

import Link from "next/link";
import Image from "next/image";
import { withBasePath } from "@/lib/base-path";

interface LogoProps {
  collapsed?: boolean;
}

export function Logo({ collapsed }: LogoProps) {
  return (
    <Link href="/admin" className="flex min-w-0 items-center gap-2">
      <div className="flex size-8 items-center justify-center">
        <Image
          src={withBasePath("/assets/images/logo-surin-polytechnic.png")}
          alt="ตราวิทยาลัยสารพัดช่างสุรินทร์"
          width={32}
          height={32}
          className="size-8 object-contain"
        />
      </div>
      {!collapsed && (
        <span className="truncate text-base font-bold tracking-normal text-foreground">
          ITA Admin
        </span>
      )}
    </Link>
  );
}
