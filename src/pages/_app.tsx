import type { AppProps } from 'next/app';
import '@/app/globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { HelmetProvider } from 'react-helmet-async';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="astralis-theme">
          <HelmetProvider>
            <Component {...pageProps} />
          </HelmetProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
