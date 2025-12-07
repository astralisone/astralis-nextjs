'use client';

import { cn } from '@/lib/utils';
import type { IntegrationProvider } from '@prisma/client';

interface IntegrationIconProps {
  provider: IntegrationProvider | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SVG icons for each integration provider
 */
export function IntegrationIcon({ provider, className, style }: IntegrationIconProps) {
  const iconClassName = cn('h-5 w-5', className);

  switch (provider) {
    case 'QUICKBOOKS':
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 16.5c-1.657 0-3-1.343-3-3V7.5h-3v6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3h.5V9h-.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5V9h.5c1.657 0 3 1.343 3 3s-1.343 3-3 3z"/>
        </svg>
      );

    case 'XERO':
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 12.5l-3.5 3.5-2-2-2 2-3.5-3.5 1.5-1.5 2 2 2-2 2 2 2-2 1.5 1.5z"/>
        </svg>
      );

    case 'HUBSPOT':
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.984 2.2 2.2 0 00-4.4 0c0 .9.545 1.678 1.327 2.016v2.791a5.927 5.927 0 00-2.881 1.327l-7.636-5.935a2.665 2.665 0 00.083-.639 2.667 2.667 0 10-2.667 2.667c.378 0 .732-.084 1.058-.222l7.534 5.86a5.91 5.91 0 00-.453 2.276c0 .752.147 1.47.398 2.133l-2.376 2.376a2.04 2.04 0 00-.652-.107 2.06 2.06 0 102.057 2.057c0-.227-.04-.444-.107-.652l2.347-2.347a5.932 5.932 0 003.78 1.367A5.944 5.944 0 0022.03 12.4a5.93 5.93 0 00-3.866-5.47zm-.227 8.837a3.37 3.37 0 01-3.37-3.37 3.37 3.37 0 116.74 0 3.37 3.37 0 01-3.37 3.37z"/>
        </svg>
      );

    case 'SALESFORCE':
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.006 5.415a4.195 4.195 0 013.045-1.306c1.56 0 2.954.9 3.69 2.205.63-.3 1.35-.45 2.1-.45 2.85 0 5.159 2.34 5.159 5.22s-2.31 5.22-5.16 5.22c-.39 0-.78-.045-1.155-.12-.63 1.38-2.025 2.34-3.66 2.34-.54 0-1.065-.105-1.545-.3a4.29 4.29 0 01-3.84 2.37c-1.95 0-3.615-1.29-4.155-3.06a3.42 3.42 0 01-.645.06c-1.875 0-3.39-1.53-3.39-3.42 0-1.215.63-2.28 1.575-2.895-.24-.51-.375-1.08-.375-1.695C1.65 6.93 3.63 4.92 6.06 4.92c.96 0 1.845.315 2.565.84.42-.21.87-.345 1.38-.345z"/>
        </svg>
      );

    case 'SLACK':
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.52 2.521h-2.522V8.834zm-1.271 0a2.528 2.528 0 01-2.521 2.521 2.528 2.528 0 01-2.521-2.521V2.522A2.528 2.528 0 0115.166 0a2.528 2.528 0 012.521 2.522v6.312zm-2.521 10.124a2.528 2.528 0 012.521 2.522A2.528 2.528 0 0115.166 24a2.528 2.528 0 01-2.521-2.52v-2.522h2.521zm0-1.271a2.528 2.528 0 01-2.521-2.521 2.528 2.528 0 012.521-2.521h6.312A2.528 2.528 0 0124 15.166a2.528 2.528 0 01-2.52 2.521h-6.313z"/>
        </svg>
      );

    case 'GMAIL':
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
        </svg>
      );

    case 'MICROSOFT_TEAMS':
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.625 8.073h-5.27v10.642h3.608c.918 0 1.662-.744 1.662-1.662V8.073zM16.5 6.375a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm3.75 0a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75zM11.625 6h-8.25A1.875 1.875 0 001.5 7.875v8.25A1.875 1.875 0 003.375 18h8.25a1.875 1.875 0 001.875-1.875v-8.25A1.875 1.875 0 0011.625 6zm-.75 9H9V9.75h1.875V15zm-3.75 0H5.25v-3.75h1.875V15z"/>
        </svg>
      );

    case 'GOOGLE_DRIVE':
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.71 3.5L1.15 15l2.76 4.72h13.22l2.76-4.72L13.33 3.5H7.71zm6.62 0l6.56 11.5H9.07l-6.56-11.5h11.82zM8.58 15.91L5.82 20.63h12.36l2.76-4.72H8.58z"/>
        </svg>
      );

    case 'DROPBOX':
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2L0 6.09l6 4.09 6-4.09L6 2zm12 0l-6 4.09 6 4.09 6-4.09L18 2zM0 14.27l6 4.09 6-4.09-6-4.09-6 4.09zm18-4.09l-6 4.09 6 4.09 6-4.09-6-4.09zM6 19.64l6 4.09 6-4.09-6-4.09-6 4.09z"/>
        </svg>
      );

    default:
      // Generic integration icon
      return (
        <svg className={iconClassName} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
  }
}
