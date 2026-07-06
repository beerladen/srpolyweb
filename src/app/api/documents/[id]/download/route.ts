import { NextResponse } from "next/server";
import { getDownloadDocument, incrementDocumentDownload } from "@/lib/document-data";

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
  const documentId = Number(id);

  if (!Number.isInteger(documentId) || documentId < 1) {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  const document = await getDownloadDocument(documentId);

  if (!document) {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  await incrementDocumentDownload(document.id, request);

  return NextResponse.redirect(redirectUrl(document.fileUrl, request, `/documents/${document.id}`));
}
