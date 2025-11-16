"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "./theme-provider"
import { PayPalProvider } from "./payment/paypal-provider"
import { NewsletterModalProvider } from "./newsletter-modal-provider"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    // SessionProvider configured but not actively used
    // Using custom AuthProvider instead - disable auto-fetching to prevent console errors
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <ThemeProvider defaultTheme="dark" storageKey="astralis-theme">
        <PayPalProvider>
          <NewsletterModalProvider>
            {children}
          </NewsletterModalProvider>
        </PayPalProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
