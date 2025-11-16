'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertCircle,
  Mail,
  ArrowRight,
  Sparkles,
  User,
  Settings,
  BookOpen,
  ShoppingBag
} from 'lucide-react';

export function NewsletterConfirmation() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriber, setSubscriber] = useState<any>(null);

  useEffect(() => {
    if (token) {
      confirmSubscription();
    } else {
      setError('Invalid or missing confirmation token');
      setLoading(false);
    }
  }, [token]);

  const confirmSubscription = async () => {
    try {
      const response = await fetch(`/api/newsletter/confirm/${token}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setConfirmed(true);
        setSubscriber(result.subscriber);
      } else {
        throw new Error(result.message || 'Failed to confirm subscription');
      }
    } catch (err) {
      console.error('Error confirming subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to confirm subscription');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-violet-900/20
                    flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Confirming your subscription...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-violet-900/20
                    flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-2">Confirmation Failed</h1>
              <p className="text-gray-400 mb-6">{error}</p>

              <Alert className="bg-blue-500/10 border-blue-500/20 mb-6">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  If your confirmation link has expired, you can try subscribing again to receive a new confirmation email.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <Link href="/newsletter">
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe Again
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                >
                  <Link href="/">
                    Return Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-violet-900/20 p-4">
        <div className="max-w-3xl mx-auto py-8 space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-green-500/20
                          to-emerald-500/20 rounded-full border border-green-500/20 mb-6">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              Welcome to Astralis!
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your newsletter subscription has been confirmed successfully. You're now part of our community of
              forward-thinking business leaders transforming their organizations with AI.
            </p>
          </div>

          {/* Subscriber Welcome */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <User className="h-5 w-5 text-purple-400" />
                <span className="text-white font-medium">
                  {subscriber?.firstName ? `Welcome, ${subscriber.firstName}!` : 'Welcome!'}
                </span>
              </div>
              <p className="text-gray-300 mb-6">
                Thank you for joining our newsletter. We'll send valuable insights, industry trends,
                and exclusive content directly to <strong className="text-white">{subscriber?.email}</strong>
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Get ready for game-changing insights!</span>
              </div>
            </CardContent>
          </Card>

          {/* What to Expect */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-blue-500/20 rounded-lg border border-blue-500/20 mb-4">
                  <Mail className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Weekly Insights</h3>
                <p className="text-gray-400 text-sm">
                  Cutting-edge AI and automation trends delivered to your inbox every week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-green-500/20 rounded-lg border border-green-500/20 mb-4">
                  <BookOpen className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Case Studies</h3>
                <p className="text-gray-400 text-sm">
                  Real-world transformation success stories and practical implementation guides
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-lg border border-purple-500/20 mb-4">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Exclusive Content</h3>
                <p className="text-gray-400 text-sm">
                  Tools, resources, and early access to new services not available elsewhere
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Ready to Transform Your Business?</h2>
                <p className="text-gray-300">
                  While you wait for your first newsletter, explore our services and discover how
                  AI can revolutionize your operations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                >
                  <Link href="/marketplace">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Explore Services
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <Link href="/blog">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Read Latest Articles
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preference Management */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-white font-medium">Manage Your Preferences</h3>
                    <p className="text-gray-400 text-sm">
                      Customize what content you receive and how often
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <Link href={`/newsletter/preferences?token=${subscriber?.unsubscribeToken}`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Questions? Contact us at{' '}
              <a
                href="mailto:ceo@astralisone.com"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                ceo@astralisone.com
              </a>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              You can unsubscribe from these emails at any time by clicking the unsubscribe link
              in any newsletter or by managing your preferences.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
