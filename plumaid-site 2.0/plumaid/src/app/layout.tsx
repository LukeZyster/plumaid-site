import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/wdth.css";
import "@fontsource-variable/figtree";
import "./globals.css";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.fullName} | Wellington & Paarl`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.fullName,
    title: `${site.fullName} | Wellington & Paarl`,
    description: site.description,
  },
  icons: { icon: "/brand/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0f1b36", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body>{children}</body>
    </html>
  );
}
