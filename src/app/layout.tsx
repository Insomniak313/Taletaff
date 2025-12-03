import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { StructuredData } from "@/components/Seo/StructuredData";
import { absoluteUrl, siteMetadata } from "@/config/siteMetadata";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ogImageUrl = absoluteUrl(siteMetadata.defaultImage);

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: "%s · Taletaff",
  },
  description: siteMetadata.description,
  applicationName: "Taletaff",
  keywords: [...siteMetadata.keywords],
  alternates: { canonical: siteMetadata.siteUrl },
  authors: [{ name: siteMetadata.organization.name, url: siteMetadata.siteUrl }],
  creator: siteMetadata.organization.name,
  publisher: siteMetadata.organization.name,
  category: "emplois",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.organization.name,
    locale: siteMetadata.locale,
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: siteMetadata.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteMetadata.twitterHandle,
    creator: siteMetadata.twitterHandle,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/window.svg",
  },
};

const LayoutShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
    <AppHeader />
    <main className="flex-1">
      <Suspense fallback={<p className="p-6 text-center text-sm">Chargement…</p>}>
        {children}
      </Suspense>
    </main>
    <AppFooter />
  </div>
);

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <html lang="fr" className="bg-[var(--background)]">
    <body
      className={`${geistSans.variable} ${geistMono.variable} bg-[var(--background)] text-[var(--foreground)] antialiased`}
    >
      <StructuredData />
      <LayoutShell>{children}</LayoutShell>
    </body>
  </html>
);

export default RootLayout;
