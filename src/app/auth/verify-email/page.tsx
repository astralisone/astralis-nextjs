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
  const email = searchParams.get('email'); // Optional email for resend

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(email || '');

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

  const handleResendVerification = async () => {
    if (!resendEmail || !resendEmail.includes('@')) {
      setResendStatus('error');
      setResendMessage('Please enter a valid email address');
      return;
    }

    setResendStatus('sending');
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend verification email');
      }

      setResendStatus('sent');
      setResendMessage(result.message || 'Verification email sent successfully');
    } catch (err) {
      setResendStatus('error');
      setResendMessage(err instanceof Error ? err.message : 'Failed to resend email');
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
        <div className="space-y-4">
          <Alert variant="error" showIcon>
            <AlertTitle>Verification failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          {/* Resend Verification Section */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Resend Verification Email
            </h3>

            {resendStatus === 'sent' ? (
              <Alert variant="success" showIcon>
                <AlertDescription>{resendMessage}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="resend-email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="resend-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-astralis-blue text-sm"
                    disabled={resendStatus === 'sending'}
                  />
                </div>

                {resendStatus === 'error' && resendMessage && (
                  <Alert variant="error">
                    <AlertDescription>{resendMessage}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleResendVerification}
                  disabled={resendStatus === 'sending' || !resendEmail}
                  variant="primary"
                  className="w-full"
                >
                  {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/auth/signup">Create a new account</Link>
            </Button>
            <Button asChild variant="ghost" className="flex-1">
              <Link href="/auth/signin">Back to sign in</Link>
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
