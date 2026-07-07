"use client";

import { Download, Printer, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type StudentReportActionsProps = {
  exportHref: string;
};

export function StudentReportActions({ exportHref }: StudentReportActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" size="sm" variant="secondary" className="h-7 rounded-full bg-white/15 px-3 text-xs text-white hover:bg-white/25" onClick={() => window.location.reload()}>
        <RotateCw className="size-3.5" />
        รีเฟรช
      </Button>
      <Button asChild size="sm" variant="secondary" className="h-7 rounded-full bg-white/15 px-3 text-xs text-white hover:bg-white/25">
        <a href={exportHref} download="srpoly-student-report.csv">
          <Download className="size-3.5" />
          Excel
        </a>
      </Button>
      <Button type="button" size="sm" variant="secondary" className="h-7 rounded-full bg-white px-3 text-xs text-blue-800 hover:bg-blue-50" onClick={() => window.print()}>
        <Printer className="size-3.5" />
        พิมพ์
      </Button>
    </div>
  );
}
