'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, SignUpInput } from '@/lib/validators/auth.validators';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    try {
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sign up failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="We sent a verification link to confirm your account"
        badge="Account Created"
        footer={
          <span>
            Ready to continue?{' '}
            <Link href="/auth/signin" className="font-semibold text-astralis-blue hover:text-astralis-blue/80">
              Return to sign-in
            </Link>
          </span>
        }
      >
        <Alert variant="success" showIcon>
          <AlertTitle>Account created</AlertTitle>
          <AlertDescription>
            Verify your email within the next 24 hours to activate AstralisOps. Once confirmed, you can sign in and invite your team.
          </AlertDescription>
        </Alert>
        <Button asChild variant="primary" className="w-full">
          <Link href="/auth/signin">Proceed to sign in</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Launch automation in days, not months"
      description="Provide a few details and we’ll tailor your workspace."
      badge="New Workspace"
      footer={
        <span>
          Already onboarded?{' '}
          <Link href="/auth/signin" className="font-semibold text-astralis-blue hover:text-astralis-blue/80">
            Sign in instead
          </Link>
        </span>
      }
    >
      {error && (
        <Alert variant="error" showIcon>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="Jordan Rivers"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-error">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 8 characters with a number and capital letter"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-error">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="orgName">Organization</Label>
          <Input
            id="orgName"
            placeholder="Astralis Labs"
            aria-invalid={Boolean(errors.orgName)}
            {...register('orgName')}
          />
          {errors.orgName && (
            <p className="text-sm text-error">{errors.orgName.message}</p>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-astralis-navy">Included with every workspace</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Concierge onboarding with automation architects</li>
            <li>Role-based access controls & multi-factor auth</li>
            <li>Dedicated Slack channel with the Astralis support team</li>
          </ul>
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating your workspace…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
