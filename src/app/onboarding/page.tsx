'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Onboarding Page
 *
 * Shown to new users (especially Google OAuth) who don't have an organization yet.
 * Allows them to create their organization before accessing the app.
 */
export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName.trim()) {
      setError('Organization name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/onboarding/create-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }

      // Update the session with the new orgId
      await update({ orgId: data.organization.id });

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-astralis-blue/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-astralis-blue" />
          </div>
          <CardTitle className="text-2xl font-bold text-astralis-navy">
            Welcome to AstralisOps
          </CardTitle>
          <CardDescription className="text-slate-600">
            {session?.user?.name ? `Hi ${session.user.name}! ` : ''}
            Let's set up your organization to get started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="orgName" className="text-sm font-medium text-astralis-navy">
                Organization Name
              </label>
              <Input
                id="orgName"
                type="text"
                placeholder="e.g., Acme Corp, My Studio"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={isLoading}
                className="w-full"
                autoFocus
              />
              <p className="text-xs text-slate-500">
                This is the name of your company or team. You can change it later in settings.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full gap-2"
              disabled={isLoading || !orgName.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
