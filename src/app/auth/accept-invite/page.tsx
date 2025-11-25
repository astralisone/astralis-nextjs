'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';

// Invitation data returned from API validation
interface InvitationData {
  email: string;
  organizationName: string;
  role: string;
  inviterName?: string;
}

// Form validation schema
const acceptInviteFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AcceptInviteFormInput = z.infer<typeof acceptInviteFormSchema>;

type PageStatus = 'loading' | 'valid' | 'invalid' | 'submitting' | 'success';

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<PageStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormInput>({
    resolver: zodResolver(acceptInviteFormSchema),
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setError('Invalid invitation link. Please check your email for the correct link.');
      return;
    }

    validateToken(token);
  }, [token]);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/accept-invite?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus('invalid');
        setError(result.error || 'This invitation link is invalid or has expired.');
        return;
      }

      setInvitation(result.data);
      setStatus('valid');
    } catch (err) {
      setStatus('invalid');
      setError('Failed to validate invitation. Please try again or contact support.');
    }
  };

  const onSubmit = async (data: AcceptInviteFormInput) => {
    if (!token) {
      setError('Invalid invitation token');
      return;
    }

    try {
      setStatus('submitting');
      setError(null);

      const response = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: data.name,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus('valid');
        setError(result.error || 'Failed to complete registration. Please try again.');
        return;
      }

      setStatus('success');

      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin?message=registration-complete');
      }, 3000);
    } catch (err) {
      setStatus('valid');
      setError('An error occurred while completing your registration. Please try again.');
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <AuthLayout
        title="Validating your invitation"
        subtitle="We&apos;re confirming the link details"
        badge="Team Invitation"
      >
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-astralis-blue" aria-hidden="true" />
          <p className="text-sm text-slate-500">Hang tight—this only takes a moment.</p>
        </div>
      </AuthLayout>
    );
  }

  // Invalid/Expired token state
  if (status === 'invalid') {
    return (
      <AuthLayout
        title="Invitation unavailable"
        subtitle="The link may have expired or already been used"
        badge="Invitation Error"
      >
        <Alert variant="error" showIcon>
          <AlertTitle>Invalid invitation</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-6 space-y-3 text-sm text-slate-500">
            <p>
              If you believe this is an error, contact the teammate who invited you or reach out to Astralis support.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" size="sm">
                <Link href="/contact">Contact support</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signin">Go to sign in</Link>
              </Button>
            </div>
          </div>
        </Alert>
      </AuthLayout>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <AuthLayout
        title={`Welcome to ${invitation?.organizationName ?? 'Astralis'}`}
        subtitle="Your access has been activated"
        badge="Registration Complete"
      >
        <Alert variant="success" showIcon>
          <AlertTitle>Registration complete</AlertTitle>
          <AlertDescription>
            Your account is ready. We&apos;re redirecting you to sign in, or you can continue manually below.
          </AlertDescription>
          <div className="mt-4">
            <Button asChild variant="primary">
              <Link href="/auth/signin">Sign in now</Link>
            </Button>
          </div>
        </Alert>
      </AuthLayout>
    );
  }

  // Valid token - show registration form
  return (
    <AuthLayout
      title={`Join ${invitation?.organizationName ?? 'your new workspace'}`}
      subtitle="Complete your profile to start collaborating"
      badge="Team Invitation"
      footer={
        <span>
          Already have access?{' '}
          <Link href="/auth/signin" className="font-semibold text-astralis-blue hover:text-astralis-blue/80">
            Sign in instead
          </Link>
        </span>
      }
    >
      <div className="rounded-xl bg-slate-50 p-4">
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-800">{invitation?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Organization</span>
            <span className="font-medium text-slate-800">{invitation?.organizationName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="font-medium capitalize text-astralis-blue">{invitation?.role?.toLowerCase()}</span>
          </div>
          {invitation?.inviterName && (
            <div className="flex justify-between">
              <span className="text-slate-500">Invited by</span>
              <span className="font-medium text-slate-800">{invitation.inviterName}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="error" showIcon>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            disabled={isSubmitting || status === 'submitting'}
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-error">{errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={isSubmitting || status === 'submitting'}
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-error">{errors.password.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            disabled={isSubmitting || status === 'submitting'}
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-astralis-navy">Password requirements</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
            <li>Minimum 8 characters</li>
            <li>Uppercase and lowercase letters</li>
            <li>At least one number</li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting || status === 'submitting'}
        >
          {isSubmitting || status === 'submitting' ? 'Finalising access…' : 'Complete registration'}
        </Button>
      </form>
    </AuthLayout>
  );
}
