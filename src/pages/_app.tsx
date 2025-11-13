import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '@/app/globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { HelmetProvider } from 'react-helmet-async';
import { SessionProvider } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Routes that should NOT have header/footer (full-screen layouts)
const excludedRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/admin',
  '/checkout',
  '/onboarding',
];

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();

  // Check if current route should have header/footer
  const showLayout = !excludedRoutes.some(route =>
    router.pathname.startsWith(route)
  );

  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="astralis-theme">
          <HelmetProvider>
            {showLayout && <Header />}
            <Component {...pageProps} />
            {showLayout && <Footer />}
          </HelmetProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
