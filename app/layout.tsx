import type { Metadata } from "next";
import { Instrument_Sans, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const manrope = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-manrope"
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
        manrope.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <body className="flex min-h-full flex-col">
        <ScrollToTop />
        <Header />

        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex text-sm items-center gap-3 rounded-lg border px-4 py-2 shadow-lg",
              success:
                "border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950 dark:text-green-100",
              error:
                "border-red-700 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
            }
          }}
        />
      </body>
    </html>
  );
}
