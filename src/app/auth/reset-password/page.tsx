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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';

// Schema for form validation (password only, token comes from URL)
const resetPasswordFormSchema = z.object({
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

type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  // Validate token presence on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormInput) => {
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    try {
      setError(null);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to reset password');
        return;
      }

      setSuccess(true);
      
      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin?message=password-reset-success');
      }, 2000);
    } catch (err) {
      setError('An error occurred while resetting your password');
    }
  };

  const hasToken = Boolean(token);
  const showForm = hasToken && !success;

  return (
    <AuthLayout
      title={success ? 'Password reset successful' : 'Create a new password'}
      subtitle={success ? 'You can now sign in with your updated credentials' : 'Choose a secure password to protect your account'}
      badge="Account Recovery"
      footer={
        <span>
          Need help?{' '}
          <Link href="/contact" className="font-semibold text-astralis-blue hover:text-astralis-blue/80">
            Contact support
          </Link>
        </span>
      }
    >
      {error && (
        <Alert variant="error" showIcon>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" showIcon>
          <AlertDescription>
            Password reset successful. We&apos;re redirecting you to sign in automatically, or you can return manually.
          </AlertDescription>
        </Alert>
      )}

      {!success && !hasToken && (
        <Alert variant="warning" showIcon>
          <AlertDescription>
            This reset link is invalid or has expired. Request a new one below.
          </AlertDescription>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/forgot-password">Request new link</Link>
            </Button>
          </div>
        </Alert>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              disabled={isSubmitting}
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
              autoComplete="new-password"
              placeholder="Re-enter your password"
              disabled={isSubmitting}
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
              <li>At least 8 characters in length</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Includes at least one number</li>
            </ul>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Updating password…' : 'Reset password'}
          </Button>
        </form>
      )}

      {!success && (
        <div className="text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link href="/auth/signin" className="font-semibold text-astralis-blue hover:text-astralis-blue/80">
            Sign in instead
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
