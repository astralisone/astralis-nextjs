'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

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
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astralis-blue mx-auto"></div>
          <p className="mt-4 text-slate-600">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid/Expired token state
  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full">
          <Alert variant="error" showIcon>
            <AlertTitle>Invalid Invitation</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <div className="mt-6 space-y-3">
              <p className="text-sm text-slate-600">
                If you believe this is an error, please contact the person who sent your invitation
                or reach out to our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/contact">
                  <Button variant="outline" size="sm">Contact Support</Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="primary" size="sm">Sign In</Button>
                </Link>
              </div>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full">
          <Alert variant="success" showIcon>
            <AlertTitle>Registration Complete!</AlertTitle>
            <AlertDescription>
              <p>
                Welcome to {invitation?.organizationName}! Your account has been created successfully.
              </p>
              <p className="mt-2 text-sm">
                Redirecting you to sign in...
              </p>
            </AlertDescription>
            <div className="mt-4">
              <Link href="/auth/signin">
                <Button variant="primary">Sign In Now</Button>
              </Link>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // Valid token - show registration form
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-astralis-navy">Join {invitation?.organizationName}</h1>
          <p className="text-slate-600 mt-2">Complete your registration to get started</p>
        </div>

        {/* Invitation details */}
        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-700">{invitation?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Organization</span>
              <span className="text-sm font-medium text-slate-700">{invitation?.organizationName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Role</span>
              <span className="text-sm font-medium text-astralis-blue capitalize">{invitation?.role?.toLowerCase()}</span>
            </div>
            {invitation?.inviterName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Invited by</span>
                <span className="text-sm font-medium text-slate-700">{invitation.inviterName}</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="error" showIcon className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              {...register('name')}
              placeholder="Enter your full name"
              disabled={isSubmitting || status === 'submitting'}
            />
            {errors.name && (
              <p className="text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Create a password"
              disabled={isSubmitting || status === 'submitting'}
            />
            {errors.password && (
              <p className="text-sm text-error">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirm your password"
              disabled={isSubmitting || status === 'submitting'}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Password requirements */}
          <div className="bg-slate-50 p-4 rounded-md">
            <p className="text-sm font-medium text-astralis-navy mb-2">
              Password Requirements:
            </p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>* At least 8 characters long</li>
              <li>* Contains at least one uppercase letter</li>
              <li>* Contains at least one lowercase letter</li>
              <li>* Contains at least one number</li>
            </ul>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting || status === 'submitting'}
          >
            {isSubmitting || status === 'submitting' ? 'Creating Account...' : 'Complete Registration'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-astralis-blue hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
