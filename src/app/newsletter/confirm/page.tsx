'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export default function NewsletterConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('Invalid confirmation link. No token provided.');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const response = await fetch(`/api/newsletter/confirm?token=${token}`, {
          method: 'GET',
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Your newsletter subscription has been confirmed!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to confirm subscription. The link may be invalid or expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while confirming your subscription. Please try again later.');
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/20 flex items-center justify-center p-4">
      <Card className="glass-elevated border-white/10 max-w-md w-full">
        <CardContent className="p-8">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Confirming Your Subscription
              </h1>
              <p className="text-gray-300">
                Please wait while we confirm your email address...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Subscription Confirmed!
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <div className="glass-card p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <p className="text-white text-sm font-semibold">You're all set!</p>
                      <p className="text-gray-300 text-xs">
                        You'll start receiving our newsletter based on your preferences.
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/')}
                  className="w-full btn-primary"
                >
                  Return to Homepage
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/blog')}
                  className="w-full glass-card border-white/20 text-white hover:border-primary-500/50"
                >
                  Browse Our Blog
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Confirmation Failed
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <div className="glass-card p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                  <p className="text-yellow-300 text-sm">
                    If you continue to experience issues, please contact us at{' '}
                    <a href="mailto:ceo@astralisone.com" className="text-yellow-400 hover:underline">
                      ceo@astralisone.com
                    </a>
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/')}
                  className="w-full btn-primary"
                >
                  Return to Homepage
                </Button>
              </div>
            </div>
          )}

          {/* Invalid State */}
          {status === 'invalid' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
                <XCircle className="w-8 h-8 text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Invalid Confirmation Link
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <Button
                onClick={() => router.push('/')}
                className="w-full btn-primary"
              >
                Return to Homepage
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
