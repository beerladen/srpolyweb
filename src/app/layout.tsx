import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { AppToastProvider } from "@/components/ui/app-toast";
import { getSiteThemePreset, themeTokensToStyle } from "@/lib/site-theme";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "วิทยาลัยสารพัดช่างสุรินทร์",
  description: "ระบบเว็บไซต์และหลังบ้าน ITA วิทยาลัยสารพัดช่างสุรินทร์",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themePreset = await getSiteThemePreset();

  return (
    <html
      lang="th"
      className={themePreset.mode === "dark" ? "dark" : undefined}
      style={themeTokensToStyle(themePreset)}
      suppressHydrationWarning
    >
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        {children}
        <AppToastProvider />
      </body>
    </html>
  );
}
