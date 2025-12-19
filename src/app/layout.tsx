import "./globals.css";
import "../styles/effects.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@/components/analytics";
import { Providers } from "./providers";

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
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        <GoogleAnalytics />
        <Providers>
          <Navigation />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
