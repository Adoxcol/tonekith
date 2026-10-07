import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "tonekith — find your tone",
    template: "%s · tonekith",
  },
  description:
    "Find your tone. Make it yours. Structured guitar tone recipes — gear, signal chains, parameters, presets, and audio.",
  icons: {
    icon: [{ url: "/brand/app-icon-dark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/app-icon-dark.svg" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${sora.className} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className={`${sora.className} flex min-h-full flex-col font-sans`}>
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
