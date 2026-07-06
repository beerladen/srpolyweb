export type MediaItem = {
  path: string;
  name?: string;
  type?: string;
  sizeKb?: number;
};

export type MediaLinkItem = {
  label: string;
  url: string;
};

function asCleanString(value: unknown): string {
  return String(value ?? "").trim();
}

export function fileNameFromPath(path: string): string {
  const cleanPath = path.split("?")[0]?.split("#")[0] ?? path;
  const filename = cleanPath.split("/").filter(Boolean).pop();
  return decodeURIComponent(filename ?? path);
}

export function inferFileType(path?: string, explicitType?: string): string {
  const explicit = asCleanString(explicitType).toUpperCase();

  if (explicit) {
    return explicit;
  }

  const extension = asCleanString(path).split("?")[0]?.split(".").pop()?.toUpperCase();

  if (!extension) {
    return "FILE";
  }

  if (["JPG", "JPEG", "PNG", "WEBP", "GIF"].includes(extension)) {
    return "IMAGE";
  }

  return extension === "JPEG" ? "IMAGE" : extension;
}

function normalizeMediaEntry(entry: unknown): MediaItem | null {
  if (typeof entry === "string") {
    const [namePart, pathPart] = entry.includes("|") ? entry.split("|").map((part) => part.trim()) : ["", entry.trim()];
    const path = pathPart || namePart;

    return path ? { path, name: namePart && pathPart ? namePart : fileNameFromPath(path) } : null;
  }

  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const path = asCleanString(record.path ?? record.url ?? record.href);

  if (!path) {
    return null;
  }

  const rawSize = Number(record.sizeKb ?? record.size_kb ?? record.size ?? 0);
  const sizeKb = Number.isFinite(rawSize) && rawSize > 0 ? rawSize : undefined;

  return {
    path,
    name: asCleanString(record.name ?? record.title ?? record.filename) || fileNameFromPath(path),
    type: asCleanString(record.type ?? record.fileType ?? record.file_type) || inferFileType(path),
    sizeKb,
  };
}

export function parseMediaItems(value?: string | null): MediaItem[] {
  const rawValue = asCleanString(value);

  if (!rawValue) {
    return [];
  }

  let entries: unknown[] | null = null;

  if (rawValue.startsWith("[") || rawValue.startsWith("{")) {
    try {
      const parsed = JSON.parse(rawValue) as unknown;
      entries = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      entries = null;
    }
  }

  const sourceEntries = entries ?? rawValue.split(/\r?\n/).filter(Boolean);
  const items = sourceEntries.map(normalizeMediaEntry).filter((item): item is MediaItem => Boolean(item));
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.path)) {
      return false;
    }

    seen.add(item.path);
    return true;
  });
}

export function serializeMediaItems(items: MediaItem[]): string {
  const normalized = items
    .map(normalizeMediaEntry)
    .filter((item): item is MediaItem => Boolean(item))
    .map((item) => ({
      path: item.path,
      name: item.name || fileNameFromPath(item.path),
      type: inferFileType(item.path, item.type),
      ...(item.sizeKb ? { sizeKb: Math.round(item.sizeKb) } : {}),
    }));

  return normalized.length ? JSON.stringify(normalized) : "";
}

function normalizeLinkEntry(entry: unknown): MediaLinkItem | null {
  if (typeof entry === "string") {
    const [labelPart, urlPart] = entry.includes("|") ? entry.split("|").map((part) => part.trim()) : ["", entry.trim()];
    const url = urlPart || labelPart;

    return url ? { label: labelPart && urlPart ? labelPart : url, url } : null;
  }

  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const url = asCleanString(record.url ?? record.href ?? record.path);

  if (!url) {
    return null;
  }

  return {
    label: asCleanString(record.label ?? record.title ?? record.name) || url,
    url,
  };
}

export function parseLinkItems(value?: string | null): MediaLinkItem[] {
  const rawValue = asCleanString(value);

  if (!rawValue) {
    return [];
  }

  let entries: unknown[] | null = null;

  if (rawValue.startsWith("[") || rawValue.startsWith("{")) {
    try {
      const parsed = JSON.parse(rawValue) as unknown;
      entries = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      entries = null;
    }
  }

  const sourceEntries = entries ?? rawValue.split(/\r?\n/).filter(Boolean);
  return sourceEntries.map(normalizeLinkEntry).filter((item): item is MediaLinkItem => Boolean(item));
}
