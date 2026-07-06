import { NextResponse } from "next/server";
import { getTrialBalanceReport, incrementTrialBalanceDownload } from "@/lib/trial-balance-data";

function redirectUrl(path: string | undefined, request: Request, fallbackPath: string): URL {
  if (!path) {
    return new URL(fallbackPath, request.url);
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return new URL(path);
  }

  return new URL(path, request.url);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reportId = Number(id);

  if (!Number.isInteger(reportId) || reportId < 1) {
    return NextResponse.redirect(new URL("/trial-balance", request.url));
  }

  const report = await getTrialBalanceReport(reportId);

  if (!report) {
    return NextResponse.redirect(new URL("/trial-balance", request.url));
  }

  await incrementTrialBalanceDownload(report.id, request);

  return NextResponse.redirect(redirectUrl(report.fileUrl, request, `/trial-balance/${report.id}`));
}
