import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import "./globals.css";

import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap"
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Montra Montijo",
    template: "%s | Montra Montijo"
  },

  description:
    "Descubra restaurantes, lojas, empresas e serviços locais no Montijo. Encontre negócios perto de si na Montra Montijo.",

  applicationName: "Montra Montijo",

  keywords: [
    "negócios no Montijo",
    "empresas no Montijo",
    "comércio local Montijo",
    "serviços no Montijo",
    "lojas no Montijo",
    "restaurantes no Montijo",
    "diretório de negócios Montijo"
  ],

  authors: [
    {
      name: "Montra Montijo"
    }
  ],

  creator: "Montra Montijo",
  publisher: "Montra Montijo",

  alternates: {
    canonical: "/"
  },

  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "/",
    siteName: "Montra Montijo",
    title: "Montra Montijo",
    description:
      "Descubra restaurantes, lojas, empresas e serviços locais no Montijo."
  },

  twitter: {
    card: "summary_large_image",
    title: "Montra Montijo",
    description:
      "Descubra restaurantes, lojas, empresas e serviços locais no Montijo."
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-PT"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <body className="flex min-h-full flex-col">
        <ScrollToTop />
        <Header />

        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
