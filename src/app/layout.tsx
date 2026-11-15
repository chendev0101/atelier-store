import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

// UI / body: neutral grotesk. Headings: light editorial serif.
const sans = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Atelier", template: "%s · Atelier" },
  description: "Considered formulations for skin, body and home.",
};

export const viewport: Viewport = {
  themeColor: "#fbfaf4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
