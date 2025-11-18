import "./globals.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Navigation } from "@/components/layout/navigation";
import { GoogleAnalytics } from "@/components/analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Astralis One | AI-Powered Operations Platform",
  description: "Automate your operations. Scale without hiring. AstralisOps centralizes intake, scheduling, document processing, and workflows into one AI-driven console.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <GoogleAnalytics />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased font-sans">
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-slate-50">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-slate-600">
              <span>© {new Date().getFullYear()} Astralis. All rights reserved.</span>
              <span>AstralisOps · Automation Services · Marketplace</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
