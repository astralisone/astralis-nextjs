'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }

      setStatus('success');
      setMessage(result.message);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  const titles = {
    loading: {
      title: 'Verifying your email',
      subtitle: 'This ensures your credentials stay secure',
    },
    success: {
      title: 'Email verified successfully',
      subtitle: 'Thanks for confirming. You can sign in now.',
    },
    error: {
      title: 'Verification unsuccessful',
      subtitle: 'The link may have expired or already been used.',
    },
  } as const;

  const { title, subtitle } = titles[status];

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
      badge="Email Verification"
      footer={
        status !== 'loading' ? (
          <span>
            Need assistance?{' '}
            <Link href="/contact" className="font-semibold text-astralis-blue hover:text-astralis-blue/80">
              Contact support
            </Link>
          </span>
        ) : undefined
      }
    >
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-astralis-blue" aria-hidden="true" />
          <p className="text-sm text-slate-500">We&apos;re validating your link. This won&apos;t take long.</p>
        </div>
      )}

      {status === 'success' && (
        <Alert variant="success" showIcon>
          <AlertTitle>Email verified</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
          <div className="mt-4">
            <Button asChild variant="primary">
              <Link href="/auth/signin">Continue to sign in</Link>
            </Button>
          </div>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="error" showIcon>
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/auth/signup">Create a new account</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/auth/forgot-password">Resend verification</Link>
            </Button>
          </div>
        </Alert>
      )}
    </AuthLayout>
  );
}
