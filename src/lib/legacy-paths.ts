import { withBasePath } from "@/lib/base-path";

const legacyRouteMap: Record<string, string> = {
  "": "/",
  "index.php": "/",
  "about.php": "/about",
  "departments.php": "/departments",
  "students.php": "/students",
  "services.php": "/services",
  "news.php": "/news",
  "documents.php": "/documents",
  "procurement.php": "/procurement",
  "plans.php": "/plans",
  "ita.php": "/ita",
  "contact.php": "/contact",
  "complaint.php": "/complaint",
  "complaint-status.php": "/complaint-status",
  "search.php": "/search",
  "content-page.php": "/content",
};

export function normalizeLegacyUrl(path?: string | null): string {
  if (!path) {
    return "/";
  }

  if (path.startsWith("http") || path.startsWith("#")) {
    return path;
  }

  const withoutPrefix = path.replace(/^\/ita(?=\/|$)/, "").replace(/^\//, "");
  const [pathWithQuery, hash = ""] = withoutPrefix.split("#");
  const [pathname, query = ""] = pathWithQuery.split("?");
  const cleanPath = pathname.replace(/^\.?\//, "");
  const hashSuffix = hash ? `#${hash}` : "";

  if (cleanPath === "content-page.php" && query) {
    const params = new URLSearchParams(query);
    const slug = params.get("slug");
    if (slug) {
      return `/content/${slug}${hashSuffix}`;
    }
  }

  if (cleanPath === "procurement.php" && query) {
    const params = new URLSearchParams(query);
    const type = params.get("type") ?? "";
    const decodedQuery = (() => {
      try {
        return decodeURIComponent(query);
      } catch {
        return query;
      }
    })();

    if (type === "รายงานงบทดลอง" || decodedQuery.includes("รายงานงบทดลอง")) {
      const year = params.get("year");
      const yearSuffix = year ? `?year=${encodeURIComponent(year)}` : "";

      return `/trial-balance${yearSuffix}${hashSuffix}`;
    }
  }

  const mapped = legacyRouteMap[cleanPath] ?? `/${cleanPath.replace(/\.php$/, "")}`;
  const querySuffix = query ? `?${query}` : "";

  return `${mapped}${querySuffix}${hashSuffix}`;
}

export function publicAssetPath(path?: string | null): string | undefined {
  if (!path) {
    return undefined;
  }

  if (path.startsWith("http") || path.startsWith("/")) {
    return withBasePath(path.replace(/^\/ita(?=\/|$)/, ""));
  }

  if (path.startsWith("assets/") || path.startsWith("uploads/")) {
    return withBasePath(`/${path}`);
  }

  return withBasePath(`/${path.replace(/^\.?\//, "")}`);
}
