import type { CSSProperties } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { queryRows } from "@/lib/db";

export type SiteThemePresetId = "srpoly-blue" | "royal-indigo" | "emerald-trust" | "darklight";

export type SiteThemePreset = {
  id: SiteThemePresetId;
  name: string;
  description: string;
  mode: "light" | "dark";
  preview: {
    background: string;
    surface: string;
    primary: string;
    accent: string;
  };
  tokens: Record<string, string>;
};

export const defaultThemePresetId: SiteThemePresetId = "srpoly-blue";

export const siteThemePresets: SiteThemePreset[] = [
  {
    id: "srpoly-blue",
    name: "SRPOLY Blue",
    description: "โทนน้ำเงิน-ขาว สุภาพ อ่านง่าย เหมาะกับเว็บไซต์วิทยาลัย",
    mode: "light",
    preview: {
      background: "#ffffff",
      surface: "#f8fbff",
      primary: "#0f57c7",
      accent: "#dff5ff",
    },
    tokens: {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.18 0.04 255)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.18 0.04 255)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.18 0.04 255)",
      "--primary": "oklch(0.44 0.18 255)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.95 0.06 88)",
      "--secondary-foreground": "oklch(0.28 0.07 70)",
      "--muted": "oklch(0.97 0.015 245)",
      "--muted-foreground": "oklch(0.47 0.04 250)",
      "--accent": "oklch(0.94 0.055 205)",
      "--accent-foreground": "oklch(0.23 0.08 250)",
      "--border": "oklch(0.9 0.025 245)",
      "--input": "oklch(0.9 0.025 245)",
      "--ring": "oklch(0.6 0.15 250)",
      "--sidebar": "oklch(0.98 0.018 245)",
      "--sidebar-foreground": "oklch(0.18 0.04 255)",
      "--sidebar-primary": "oklch(0.44 0.18 255)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-accent": "oklch(0.93 0.06 205)",
      "--sidebar-accent-foreground": "oklch(0.23 0.08 250)",
      "--sidebar-border": "oklch(0.9 0.025 245)",
      "--sidebar-ring": "oklch(0.6 0.15 250)",
    },
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    description: "น้ำเงินอมม่วงกับทองอ่อน ดูทางการและทันสมัย",
    mode: "light",
    preview: {
      background: "#fbfbff",
      surface: "#eef2ff",
      primary: "#4338ca",
      accent: "#fde68a",
    },
    tokens: {
      "--background": "oklch(0.995 0.006 275)",
      "--foreground": "oklch(0.19 0.05 270)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.19 0.05 270)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.19 0.05 270)",
      "--primary": "oklch(0.45 0.2 275)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.93 0.07 88)",
      "--secondary-foreground": "oklch(0.31 0.07 72)",
      "--muted": "oklch(0.96 0.022 270)",
      "--muted-foreground": "oklch(0.47 0.05 270)",
      "--accent": "oklch(0.94 0.055 268)",
      "--accent-foreground": "oklch(0.24 0.09 272)",
      "--border": "oklch(0.89 0.035 270)",
      "--input": "oklch(0.89 0.035 270)",
      "--ring": "oklch(0.58 0.17 272)",
      "--sidebar": "oklch(0.97 0.025 270)",
      "--sidebar-foreground": "oklch(0.19 0.05 270)",
      "--sidebar-primary": "oklch(0.45 0.2 275)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-accent": "oklch(0.93 0.06 268)",
      "--sidebar-accent-foreground": "oklch(0.24 0.09 272)",
      "--sidebar-border": "oklch(0.89 0.035 270)",
      "--sidebar-ring": "oklch(0.58 0.17 272)",
    },
  },
  {
    id: "emerald-trust",
    name: "Emerald Trust",
    description: "เขียวมรกตกับฟ้าอ่อน ให้ความรู้สึกสะอาด เป็นมิตร และเชื่อถือได้",
    mode: "light",
    preview: {
      background: "#ffffff",
      surface: "#ecfdf5",
      primary: "#047857",
      accent: "#d9f99d",
    },
    tokens: {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.18 0.045 180)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.18 0.045 180)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.18 0.045 180)",
      "--primary": "oklch(0.46 0.14 165)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.94 0.08 128)",
      "--secondary-foreground": "oklch(0.25 0.08 155)",
      "--muted": "oklch(0.97 0.02 165)",
      "--muted-foreground": "oklch(0.44 0.045 175)",
      "--accent": "oklch(0.94 0.07 190)",
      "--accent-foreground": "oklch(0.22 0.08 170)",
      "--border": "oklch(0.89 0.03 170)",
      "--input": "oklch(0.89 0.03 170)",
      "--ring": "oklch(0.58 0.13 165)",
      "--sidebar": "oklch(0.98 0.02 165)",
      "--sidebar-foreground": "oklch(0.18 0.045 180)",
      "--sidebar-primary": "oklch(0.46 0.14 165)",
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-accent": "oklch(0.93 0.055 185)",
      "--sidebar-accent-foreground": "oklch(0.22 0.08 170)",
      "--sidebar-border": "oklch(0.89 0.03 170)",
      "--sidebar-ring": "oklch(0.58 0.13 165)",
    },
  },
  {
    id: "darklight",
    name: "Dark Light",
    description: "โหมดเข้มแบบอ่านง่าย ใช้พื้นหลังกรมท่าและแสงฟ้าสำหรับจุดสำคัญ",
    mode: "dark",
    preview: {
      background: "#0f172a",
      surface: "#1e293b",
      primary: "#38bdf8",
      accent: "#f8fafc",
    },
    tokens: {
      "--background": "oklch(0.18 0.045 260)",
      "--foreground": "oklch(0.97 0.01 245)",
      "--card": "oklch(0.23 0.045 260)",
      "--card-foreground": "oklch(0.97 0.01 245)",
      "--popover": "oklch(0.23 0.045 260)",
      "--popover-foreground": "oklch(0.97 0.01 245)",
      "--primary": "oklch(0.72 0.15 235)",
      "--primary-foreground": "oklch(0.16 0.05 260)",
      "--secondary": "oklch(0.3 0.06 250)",
      "--secondary-foreground": "oklch(0.96 0.02 245)",
      "--muted": "oklch(0.29 0.04 260)",
      "--muted-foreground": "oklch(0.75 0.03 245)",
      "--accent": "oklch(0.31 0.08 235)",
      "--accent-foreground": "oklch(0.96 0.02 245)",
      "--border": "oklch(1 0 0 / 14%)",
      "--input": "oklch(1 0 0 / 18%)",
      "--ring": "oklch(0.72 0.15 235)",
      "--sidebar": "oklch(0.21 0.045 260)",
      "--sidebar-foreground": "oklch(0.96 0.02 245)",
      "--sidebar-primary": "oklch(0.72 0.15 235)",
      "--sidebar-primary-foreground": "oklch(0.16 0.05 260)",
      "--sidebar-accent": "oklch(0.29 0.055 250)",
      "--sidebar-accent-foreground": "oklch(0.96 0.02 245)",
      "--sidebar-border": "oklch(1 0 0 / 14%)",
      "--sidebar-ring": "oklch(0.72 0.15 235)",
    },
  },
];

const presetMap = new Map(siteThemePresets.map((preset) => [preset.id, preset]));

export function isThemePresetId(value: unknown): value is SiteThemePresetId {
  return typeof value === "string" && presetMap.has(value as SiteThemePresetId);
}

export function getThemePreset(value?: unknown): SiteThemePreset {
  return presetMap.get(isThemePresetId(value) ? value : defaultThemePresetId) ?? siteThemePresets[0];
}

export function themeTokensToStyle(preset: SiteThemePreset): CSSProperties & Record<`--${string}`, string> {
  return preset.tokens as CSSProperties & Record<`--${string}`, string>;
}

export async function getSiteThemePreset(): Promise<SiteThemePreset> {
  noStore();

  const rows = await queryRows<{ setting_value: string | null }>(
    "SELECT setting_value FROM site_settings WHERE setting_key = 'theme_preset' LIMIT 1"
  );

  return getThemePreset(rows?.[0]?.setting_value);
}
