import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

// Using system fonts for build compatibility
// Note: In production, consider using a CDN or local font files

export const metadata: Metadata = {
  title: "Astralis Agency",
  description: "Premium digital agency services with dark theme design system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <GoogleAnalytics />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
