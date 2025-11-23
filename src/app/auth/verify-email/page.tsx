'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full">
        {status === 'loading' && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astralis-blue mx-auto"></div>
            <p className="mt-4 text-slate-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <Alert variant="success" showIcon>
            <AlertTitle>Email Verified!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            <div className="mt-4">
              <Link href="/auth/signin">
                <Button variant="primary">Sign In</Button>
              </Link>
            </div>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="error" showIcon>
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            <div className="mt-4">
              <Link href="/auth/signup">
                <Button variant="outline">Sign Up Again</Button>
              </Link>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
}
