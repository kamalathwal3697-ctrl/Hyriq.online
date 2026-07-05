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
      <body className="min-h-full flex flex-col font-sans mesh-bg text-slate-800 antialiased selection:bg-blue-500/10">
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </body>
    </html>
  );
}
