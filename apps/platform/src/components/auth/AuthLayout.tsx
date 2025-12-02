'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '../ui';

interface AuthHighlight {
  title: string;
  description: string;
}

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  highlights?: AuthHighlight[];
  illustration?: React.ReactNode;
}

const defaultHighlights: AuthHighlight[] = [
  {
    title: 'Enterprise-Grade Security',
    description: 'SOC 2 aligned controls, SSO & audit trails out of the box.',
  },
  {
    title: 'Hands-on Onboarding',
    description: 'Dedicated automation specialists to guide your first 90 days.',
  },
  {
    title: '24/7 Support',
    description: 'Critical-response team ready to assist whenever you need help.',
  },
];

export function AuthLayout({
  title,
  subtitle,
  description,
  badge = 'Astralis One',
  children,
  footer,
  highlights = defaultHighlights,
  illustration,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-16 h-72 w-72 rounded-full bg-astralis-blue/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,76,129,0.35),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="relative flex w-full flex-col justify-between gap-10 px-8 py-10 text-white lg:w-[46%] lg:px-16">
          <Link
            href="/"
            className="flex items-center gap-3 text-white transition-colors duration-200 hover:text-astralis-blue"
            aria-label="Back to Astralis home"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <Image
                src="/images/user-logo.jpeg"
                alt="Astralis logo"
                width={40}
                height={40}
                className="h-9 w-9 rounded-full object-cover"
                priority
              />
            </span>
            <span className="text-lg font-semibold tracking-tight">Astralis One</span>
          </Link>

          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
              {badge}
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
              Automation built for teams who ship fast.
            </h1>
            <p className="max-w-lg text-sm text-slate-200/85 md:text-base">
              Pair thoughtful human support with dependable automation workflows. From identity and scheduling to document intelligence, Astralis keeps your entire team operating in sync.
            </p>

            <div className="space-y-5">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-astralis-blue" />
                  <div>
                    <p className="text-sm font-semibold text-white/90 md:text-base">{item.title}</p>
                    <p className="text-sm text-white/70 md:text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-3 text-xs text-white/60 lg:flex">
            <span>&copy; {new Date().getFullYear()} Astralis Operations Platform</span>
            <span aria-hidden="true">•</span>
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/terms-of-service" className="hover:text-white">
              Terms
            </Link>
          </div>
        </aside>

        <main className="flex w-full items-center justify-center px-6 py-12 sm:px-10 lg:w-[54%] lg:pl-20 lg:pr-16">
          <div className="mx-auto w-full max-w-[480px]">
            <div className="rounded-2xl border border-white/20 bg-white/95 p-8 shadow-[0_20px_60px_-12px_rgba(9,24,45,0.25)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_24px_72px_-12px_rgba(9,24,45,0.35)] md:p-10">
              {illustration && (
                <div className="mb-6 flex justify-center">{illustration}</div>
              )}
              <div className="space-y-3 text-center md:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-astralis-navy md:text-3xl">{title}</h2>
                {subtitle && (
                  <p className="text-base font-medium text-slate-700">{subtitle}</p>
                )}
                {description && (
                  <p className="text-sm text-slate-500">{description}</p>
                )}
              </div>

              <div className="mt-8 space-y-6">{children}</div>

              {footer && (
                <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm text-slate-500 md:text-left">
                  {footer}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center text-xs text-slate-400 lg:hidden">
              <span>&copy; {new Date().getFullYear()} Astralis Operations Platform</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
