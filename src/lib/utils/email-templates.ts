import { sendEmail } from '@/lib/email';

// Use NEXTAUTH_URL for auth-related links, fall back to API base URL without /api suffix
const BASE_URL = process.env.NEXTAUTH_URL ||
  (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, '')) ||
  'http://localhost:3001';

/**
 * Send email verification link
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${BASE_URL}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Verify Your Email - AstralisOps</title>
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #0A1B2B; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2B6CB0; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AstralisOps</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A1B2B; margin-top: 0;">Verify Your Email Address</h2>

        <p>Thank you for signing up for AstralisOps! Please verify your email address by clicking the button below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2B6CB0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Verify Email Address
          </a>
        </div>

        <p style="color: #718096; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${verifyUrl}" style="color: #2B6CB0; word-break: break-all;">${verifyUrl}</a>
        </p>

        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
          This verification link will expire in 24 hours.
        </p>

        <p style="color: #718096; font-size: 14px;">
          If you didn't create an account with AstralisOps, you can safely ignore this email.
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
        <p>© 2025 Astralis. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Verify Your Email Address

    Thank you for signing up for AstralisOps!

    Please verify your email address by visiting this link:
    ${verifyUrl}

    This verification link will expire in 24 hours.

    If you didn't create an account with AstralisOps, you can safely ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - AstralisOps',
    html,
    text,
  });
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Password - AstralisOps</title>
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #0A1B2B; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2B6CB0; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AstralisOps</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A1B2B; margin-top: 0;">Reset Your Password</h2>

        <p>We received a request to reset your password. Click the button below to set a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2B6CB0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </div>

        <p style="color: #718096; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #2B6CB0; word-break: break-all;">${resetUrl}</a>
        </p>

        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
          This password reset link will expire in 1 hour.
        </p>

        <p style="color: #718096; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
        <p>© 2025 Astralis. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Reset Your Password

    We received a request to reset your password.

    Visit this link to set a new password:
    ${resetUrl}

    This password reset link will expire in 1 hour.

    If you didn't request a password reset, you can safely ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - AstralisOps',
    html,
    text,
  });
}
