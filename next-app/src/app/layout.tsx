import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HYRIQ | Punjab's Vibe Match Career Platform",
  description: "Create a modern hiring platform where companies can post jobs and candidates can find jobs, apply instantly, chat with recruiters, upload resumes, and receive AI-powered recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-950 text-slate-50 antialiased selection:bg-indigo-500/20">
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </body>
    </html>
  );
}
