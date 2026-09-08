import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppContext";
import Script from "next/script";

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
  metadataBase: new URL("https://www.hyriq.online"),
  title: {
    default: "HYRIQ - Verified Job Updates, AI Resume Parser & Career Match",
    template: "%s | HYRIQ",
  },
  description:
    "Discover verified private & government jobs across India. AI resume parsing, candidate match scoring, and lifetime job alert access for students, freshers, and professionals.",
  keywords: [
    "job search India",
    "verified job updates",
    "government jobs notification",
    "Punjab tech jobs",
    "AI resume parser",
    "lifetime job subscription",
    "fresher jobs India",
    "work from home jobs",
    "recruitment platform India",
    "HYRIQ online",
    "career matching platform"
  ],
  authors: [{ name: "HYRIQ", url: "https://www.hyriq.online" }],
  creator: "HYRIQ",
  publisher: "HYRIQ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.hyriq.online",
  },
  openGraph: {
    title: "HYRIQ - Verified Jobs & AI Career Platform in India",
    description:
      "Find top verified jobs in India with AI-powered resume matching and daily job alerts. Pay once for lifetime access.",
    url: "https://www.hyriq.online",
    siteName: "HYRIQ",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HYRIQ - Verified Jobs & AI Career Platform in India",
    description:
      "Find top verified jobs in India with AI-powered resume matching and daily alerts. Lifetime access with one-time payment.",
    creator: "@hyriq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.hyriq.online/#organization",
      "name": "HYRIQ",
      "url": "https://www.hyriq.online",
      "logo": "https://www.hyriq.online/logo.png",
      "description": "Punjab's leading candidate vetting and corporate career matching platform connecting companies with top talent.",
      "sameAs": [
        "https://www.linkedin.com/company/hyriq",
        "https://twitter.com/hyriq"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.hyriq.online/#website",
      "url": "https://www.hyriq.online",
      "name": "HYRIQ",
      "description": "Verified Job Updates, AI Resume Parser & Career Matching Platform in India",
      "publisher": {
        "@id": "https://www.hyriq.online/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.hyriq.online/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

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
            __html: JSON.stringify(structuredData),
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
