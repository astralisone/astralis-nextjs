"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "./theme-provider"
import { PayPalProvider } from "./payment/paypal-provider"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="dark" storageKey="astralis-theme">
        <PayPalProvider>
          {children}
        </PayPalProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
