import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/crypto';
import { generateToken } from '@/lib/utils/crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/utils/email-templates';
import { SignUpInput } from '@/lib/validators/auth.validators';

/**
 * Email retry result interface
 */
interface EmailRetryResult {
  success: boolean;
  attempts: number;
  error?: string;
}

/**
 * In-memory rate limiter for resend verification requests
 * Maps email to last send timestamp
 */
const resendRateLimiter = new Map<string, number>();

/**
 * Check if user can resend verification email (1 minute cooldown)
 */
function canResendVerification(email: string): { allowed: boolean; waitSeconds?: number } {
  const lastSent = resendRateLimiter.get(email);
  const now = Date.now();
  const cooldownMs = 60000; // 1 minute

  if (lastSent && now - lastSent < cooldownMs) {
    const waitSeconds = Math.ceil((cooldownMs - (now - lastSent)) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

/**
 * Update rate limiter after sending
 */
function updateResendRateLimit(email: string): void {
  resendRateLimiter.set(email, Date.now());
}

/**
 * Clean up old rate limiter entries (called periodically)
 */
setInterval(() => {
  const now = Date.now();
  const expiryMs = 300000; // 5 minutes
  const emailsToDelete: string[] = [];

  resendRateLimiter.forEach((timestamp, email) => {
    if (now - timestamp > expiryMs) {
      emailsToDelete.push(email);
    }
  });

  emailsToDelete.forEach(email => resendRateLimiter.delete(email));
}, 60000); // Run every minute

/**
 * Send verification email with retry logic
 * Attempts 3 times with exponential backoff: 1s, 5s, 30s
 */
async function sendVerificationEmailWithRetry(
  email: string,
  token: string,
  userId?: string
): Promise<EmailRetryResult> {
  const delays = [1000, 5000, 30000]; // 1s, 5s, 30s
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < delays.length; attempt++) {
    try {
      console.log(`[Auth] Sending verification email to ${email}, attempt ${attempt + 1}/${delays.length}`);

      await sendVerificationEmail(email, token);

      console.log(`[Auth] Verification email sent successfully on attempt ${attempt + 1}`);

      // Log successful send in activity log if userId provided
      if (userId) {
        // Get user's orgId for activity log
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { orgId: true }
        });

        if (user?.orgId) {
          await prisma.activityLog.create({
            data: {
              userId,
              orgId: user.orgId,
              action: 'EMAIL_SENT',
              entity: 'USER',
              entityId: userId,
              metadata: {
                type: 'VERIFICATION_EMAIL',
                attempts: attempt + 1,
                email,
              }
            }
          }).catch(err => {
            console.error('[Auth] Failed to log email send activity:', err);
          });
        }
      }

      return { success: true, attempts: attempt + 1 };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Auth] Email send attempt ${attempt + 1} failed:`, lastError.message);

      // Don't wait after the last attempt
      if (attempt < delays.length - 1) {
        console.log(`[Auth] Waiting ${delays[attempt]}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      }
    }
  }

  console.error(`[Auth] All ${delays.length} email attempts failed for ${email}`);

  // Log failed send in activity log if userId provided
  if (userId) {
    // Get user's orgId for activity log
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { orgId: true }
    });

    if (user?.orgId) {
      await prisma.activityLog.create({
        data: {
          userId,
          orgId: user.orgId,
          action: 'EMAIL_FAILED',
          entity: 'USER',
          entityId: userId,
          metadata: {
            type: 'VERIFICATION_EMAIL',
            attempts: delays.length,
            email,
            error: lastError?.message || 'Unknown error',
          }
        }
      }).catch(err => {
        console.error('[Auth] Failed to log email failure activity:', err);
      });
    }
  }

  return {
    success: false,
    attempts: delays.length,
    error: lastError?.message || 'Unknown error'
  };
}

export class AuthService {
  /**
   * Register new user with organization
   */
  async signUp(data: SignUpInput) {
    const { email, password, name, orgName } = data;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create organization and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const org = await tx.organization.create({
        data: {
          name: orgName,
        }
      });

      // Create user
      const user = await tx.users.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN', // First user is admin
          orgId: org.id,
        }
      });

      // Create verification token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: tokenExpiry,
        }
      });

      // Log account creation
      await tx.activityLog.create({
        data: {
          userId: user.id,
          orgId: org.id,
          action: 'CREATE',
          entity: 'USER',
          entityId: user.id,
          metadata: {
            email,
            name,
            source: 'SIGNUP',
          }
        }
      });

      return { user, org, verificationToken };
    });

    // Send verification email with retry logic
    const emailResult = await sendVerificationEmailWithRetry(email, verificationToken, result.user.id);

    if (!emailResult.success) {
      console.error('[AuthService.signUp] Failed to send verification email after retries:', emailResult.error);
      return {
        success: true,
        message: 'Account created, but we could not send the verification email. Please use the "Resend verification" option to try again.',
        userId: result.user.id,
        emailSent: false,
      };
    }

    return {
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: result.user.id,
      emailSent: true,
    };
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired verification token');
    }

    if (new Date() > verificationToken.expires) {
      throw new Error('Verification token has expired');
    }

    // Update user email verification
    const user = await prisma.users.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() }
    });

    // Log email verification (only if user has an org)
    if (user.orgId) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          orgId: user.orgId,
          action: 'UPDATE',
          entity: 'USER',
          entityId: user.id,
          metadata: {
            action: 'EMAIL_VERIFIED',
            email: user.email,
          }
        }
      });
    }

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token }
    });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    // Check rate limit
    const rateLimitCheck = canResendVerification(email);
    if (!rateLimitCheck.allowed) {
      throw new Error(`Please wait ${rateLimitCheck.waitSeconds} seconds before requesting another email`);
    }

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, emailVerified: true, orgId: true }
    });

    if (!user) {
      // Don't reveal if email exists - but still update rate limit
      updateResendRateLimit(email);
      return {
        success: true,
        message: 'If the email exists and is not verified, a verification link has been sent.',
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: 'Email is already verified',
      };
    }

    // Generate new token (expires in 24 hours)
    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Delete old tokens and create new one
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    // Update rate limiter
    updateResendRateLimit(email);

    // Send email with retry
    const result = await sendVerificationEmailWithRetry(email, token, user.id);

    // Log resend attempt (only if user has an org)
    if (user.orgId) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          orgId: user.orgId,
          action: 'UPDATE',
          entity: 'USER',
          entityId: user.id,
          metadata: {
            action: 'VERIFICATION_EMAIL_RESENT',
            email,
            success: result.success,
            attempts: result.attempts,
          }
        }
      });
    }

    if (result.success) {
      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } else {
      throw new Error('Failed to send verification email. Please try again later.');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: tokenExpiry,
      }
    });

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    return {
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date() > verificationToken.expires) {
      throw new Error('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.users.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword }
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token }
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}

export const authService = new AuthService();
