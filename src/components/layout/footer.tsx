"use client";

import Link from 'next/link';
import { Shield, Award, CheckCircle } from 'lucide-react';

/**
 * Footer Component
 * Updated to match mockup design:
 * - LEFT: MicroFaster branding
 * - CENTER: Trust badges (ISO 27001, SOC 2 Type II, GDPR Compliant)
 * - RIGHT: Privacy link with Twitter and Facebook icons
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-8 py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* LEFT: MicroFaster Branding */}
          <div className="flex-shrink-0">
            <span className="text-xl font-bold text-astralis-navy">
              MicroFaster
            </span>
          </div>

          {/* CENTER: Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
            {/* ISO 27001 */}
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-astralis-blue" />
              <span className="text-sm font-medium text-slate-700">
                ISO 27001
              </span>
            </div>

            {/* SOC 2 Type II */}
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-astralis-blue" />
              <span className="text-sm font-medium text-slate-700">
                SOC 2 Type II
              </span>
            </div>

            {/* GDPR Compliant */}
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-astralis-blue" />
              <span className="text-sm font-medium text-slate-700">
                GDPR Compliant
              </span>
            </div>
          </div>

          {/* RIGHT: Privacy Link and Social Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm font-medium text-slate-600 hover:text-astralis-blue transition-colors duration-200"
            >
              Privacy
            </Link>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {/* Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-astralis-blue transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-astralis-blue transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
