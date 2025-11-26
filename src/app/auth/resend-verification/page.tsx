'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend verification email');
      }

      setStatus('sent');
      setMessage(result.message || 'Verification email sent successfully');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Failed to resend email');
    }
  };

  return (
    <AuthLayout
      title="Resend Verification Email"
      subtitle="Enter your email to receive a new verification link"
      badge="Email Verification"
      footer={
        <span>
          Already verified?{' '}
          <Link href="/auth/signin" className="font-semibold text-astralis-blue hover:text-astralis-blue/80">
            Sign in
          </Link>
        </span>
      }
    >
      {status === 'sent' ? (
        <Alert variant="success" showIcon>
          <AlertTitle>Email sent successfully</AlertTitle>
          <AlertDescription>
            {message}
            <br />
            <br />
            Please check your inbox and click the verification link.
          </AlertDescription>
          <div className="mt-4 flex gap-3">
            <Button asChild variant="primary">
              <Link href="/auth/signin">Go to sign in</Link>
            </Button>
            <Button
              onClick={() => {
                setStatus('idle');
                setMessage('');
              }}
              variant="outline"
            >
              Send another
            </Button>
          </div>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-astralis-blue"
              disabled={status === 'sending'}
            />
          </div>

          {status === 'error' && message && (
            <Alert variant="error" showIcon>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can request a new verification email once per minute.
              The link will be valid for 24 hours.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={status === 'sending' || !email}
          >
            {status === 'sending' ? 'Sending...' : 'Resend Verification Email'}
          </Button>

          <div className="flex flex-col gap-2 text-center text-sm">
            <Link href="/auth/signin" className="text-astralis-blue hover:text-astralis-blue/80">
              Back to sign in
            </Link>
            <Link href="/auth/signup" className="text-slate-600 hover:text-slate-900">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
