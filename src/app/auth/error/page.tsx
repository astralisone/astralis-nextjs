'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    CredentialsSignin: 'Invalid email or password.',
    Default: 'An error occurred during authentication.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  console.log('Auth error:', error);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full">
        <Alert variant="error" showIcon>
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {errorMessage}
            {error && <div className="mt-2 text-sm text-slate-600">Error code: {error}</div>}
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Link href="/auth/signin">
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-astralis-blue text-white font-medium hover:bg-blue-600 transition-colors duration-200">
              Back to Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
