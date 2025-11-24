'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, LoginInput } from '@/lib/validators/auth.validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Card } from '@/components/ui';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError('An error occurred during sign in');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      setError('An error occurred during Google sign in');
    }
  };

  const successKey = searchParams.get('message');
  const successCopy = successKey === 'password-reset-success'
    ? 'Your password has been reset. Sign in with your new credentials.'
    : successKey === 'registration-complete'
    ? 'Registration complete! Sign in to start automating with Astralis.'
    : null;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Astralis workspace"
      description="Secure authentication powered by Astralis Identity."
      
      badge="Secure Sign-In"
      footer={
        <span>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-semibold text-astralis-blue hover:text-astralis-blue/80">
            Create one in minutes
          </Link>
        </span>
      }
    >
      {successCopy && (
        <Alert variant="success" showIcon>
          <AlertDescription>{successCopy}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="error" showIcon>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 md:p-8" hover>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="h-11 text-base"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm font-medium text-error animate-in fade-in-50 duration-200">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-astralis-blue transition-colors hover:text-astralis-blue/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astralis-blue focus-visible:ring-offset-2 rounded"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-11 text-base"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm font-medium text-error animate-in fade-in-50 duration-200">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full h-11 text-base font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
      </Card>

      <div className="space-y-5">
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            or
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold text-base transition-all"
          onClick={handleGoogleSignIn}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>
    </AuthLayout>
  );
}
