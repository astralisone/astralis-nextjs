'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-astralis-navy">Reset Password</h1>
          <p className="text-slate-600 mt-2">Enter your new password</p>
        </div>

        {error && (
          <Alert variant="error" showIcon className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" showIcon className="mb-6">
            <AlertDescription>
              Password reset successful! Redirecting to sign in...
            </AlertDescription>
          </Alert>
        )}

        {!success && token && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Enter new password"
                disabled={isSubmitting}
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
                placeholder="Confirm new password"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-md">
              <p className="text-sm font-medium text-astralis-navy mb-2">
                Password Requirements:
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Contains at least one uppercase letter</li>
                <li>• Contains at least one lowercase letter</li>
                <li>• Contains at least one number</li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        )}

        {!token && (
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-astralis-blue hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-600">
          Remember your password?{' '}
          <Link href="/auth/signin" className="text-astralis-blue hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
