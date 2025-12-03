import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { siteMetadata } from "@/config/siteMetadata";
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

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  metadataBase: new URL(siteMetadata.siteUrl),
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: "Taletaff",
    images: [siteMetadata.defaultImage],
  },
  twitter: {
    card: "summary_large_image",
    site: siteMetadata.twitterHandle,
  },
};

const LayoutShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-slate-50">
    <AppHeader />
    <main className="flex-1 bg-slate-50">
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
  <html lang="fr" className="bg-slate-50">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <LayoutShell>{children}</LayoutShell>
    </body>
  </html>
);

export default RootLayout;
