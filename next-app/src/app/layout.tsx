import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif-editorial",
});

export const metadata: Metadata = {
  title: "HYRIQ | sleep deeply, hire fully",
  description: "A premium AI-powered vibe matching career platform designed for modern professional hiring.",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "HYRIQ",
              "url": "https://hyriq.online",
              "logo": "https://hyriq.online/logo.png",
              "description": "A premium AI-powered vibe matching career platform designed for modern professional hiring.",
              "sameAs": [
                "https://www.linkedin.com/company/hyriq",
                "https://twitter.com/hyriq"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-600 antialiased selection:bg-blue-500/10">
        <AppStateProvider>
          {children}
        </AppStateProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
