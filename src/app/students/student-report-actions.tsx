"use client";

import { Download, Printer, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type StudentReportActionsProps = {
  exportHref: string;
};

export function StudentReportActions({ exportHref }: StudentReportActionsProps) {
  return (
    <div className="grid w-full gap-2 md:grid-cols-3">
      <Button type="button" variant="secondary" className="h-8 rounded-full bg-white/15 text-white hover:bg-white/25" onClick={() => window.location.reload()}>
        <RotateCw data-icon="inline-start" />
        รีเฟรชข้อมูล
      </Button>
      <Button asChild variant="secondary" className="h-8 rounded-full bg-white/15 text-white hover:bg-white/25">
        <a href={exportHref} download="srpoly-student-report.csv">
          <Download data-icon="inline-start" />
          ส่งออก Excel
        </a>
      </Button>
      <Button type="button" variant="secondary" className="h-8 rounded-full bg-white text-blue-800 hover:bg-blue-50" onClick={() => window.print()}>
        <Printer data-icon="inline-start" />
        พิมพ์รายงาน
      </Button>
    </div>
  );
}
