import { unstable_noStore as noStore } from "next/cache";
import { queryRows } from "@/lib/db";

export type SitePopup = {
  id: number;
  title: string;
  eyebrow: string | null;
  body: string | null;
  imagePath: string | null;
  imageAlt: string | null;
  primaryLabel: string | null;
  primaryHref: string | null;
  primaryTarget: "self" | "blank";
  secondaryLabel: string | null;
  displayScope: "all" | "home" | "site";
  showFrequency: "once_per_session" | "always";
};

function normalizeScope(active?: string): "home" | "site" {
  return active === "home" ? "home" : "site";
}

export async function getActiveSitePopup(active?: string): Promise<SitePopup | null> {
  noStore();

  const rows = await queryRows<{
    id: number;
    title: string;
    eyebrow: string | null;
    body: string | null;
    image_path: string | null;
    image_alt: string | null;
    primary_label: string | null;
    primary_href: string | null;
    primary_target: string | null;
    secondary_label: string | null;
    display_scope: string | null;
    show_frequency: string | null;
  }>(
    `SELECT id, title, eyebrow, body, image_path, image_alt, primary_label, primary_href,
            primary_target, secondary_label, display_scope, show_frequency
     FROM site_popups
     WHERE status = 'active'
       AND (display_scope = 'all' OR display_scope = ?)
       AND (starts_at IS NULL OR starts_at <= NOW())
       AND (ends_at IS NULL OR ends_at >= NOW())
     ORDER BY sort_order ASC, COALESCE(starts_at, created_at) DESC, id DESC
     LIMIT 1`,
    [normalizeScope(active)]
  );

  const row = rows?.[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    eyebrow: row.eyebrow,
    body: row.body,
    imagePath: row.image_path,
    imageAlt: row.image_alt,
    primaryLabel: row.primary_label,
    primaryHref: row.primary_href,
    primaryTarget: row.primary_target === "blank" ? "blank" : "self",
    secondaryLabel: row.secondary_label,
    displayScope: row.display_scope === "home" || row.display_scope === "site" ? row.display_scope : "all",
    showFrequency: row.show_frequency === "always" ? "always" : "once_per_session",
  };
}
