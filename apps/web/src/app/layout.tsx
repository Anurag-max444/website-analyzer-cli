import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SiteScope — Website Analyzer",
    template: "%s | SiteScope",
  },
  description:
    "Analyze any website for SEO, Performance, Security, Accessibility, Tech Stack and more. Free, fast, and developer-friendly.",
  keywords: ["website analyzer", "seo checker", "performance audit", "security scan", "sitescope"],
  authors: [{ name: "Ayush", url: "https://sitescope.dev" }],
  creator: "Ayush",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sitescope.dev",
    title: "SiteScope — Website Analyzer",
    description: "Analyze any website for SEO, Performance, Security & more.",
    siteName: "SiteScope",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteScope — Website Analyzer",
    description: "Analyze any website for SEO, Performance, Security & more.",
    creator: "@ayush",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
