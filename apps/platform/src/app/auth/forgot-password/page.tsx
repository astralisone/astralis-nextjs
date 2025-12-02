'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordRequestSchema, ResetPasswordRequestInput } from '@/lib/validators/auth.validators';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
  });

  const onSubmit = async (data: ResetPasswordRequestInput) => {
    try {
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to send reset email');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a secure link to regain access"
      badge="Account Recovery"
      footer={
        <span>
          Remembered it?{' '}
          <Link href="/auth/signin" className="font-semibold text-astralis-blue hover:text-astralis-blue/80">
            Return to sign in
          </Link>
        </span>
      }
    >
      {error && (
        <Alert variant="error" showIcon>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success ? (
        <Alert variant="success" showIcon>
          <AlertDescription>
            If an account exists with that email, you&apos;ll receive reset instructions shortly. The link expires in 30 minutes for security.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending reset link…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
