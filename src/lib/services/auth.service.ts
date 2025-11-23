import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/crypto';
import { generateToken } from '@/lib/utils/crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/utils/email-templates';
import { SignUpInput } from '@/lib/validators/auth.validators';

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

   // Send verification email (best-effort)
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.error('[AuthService.signUp] Failed to send verification email:', err);
      // Do NOT throw – account is created, email is optional side-effect
      // TODO: throw an error
    }

    return {
      success: true,
      message: 'Account created. If email delivery is delayed, you can request a new verification link from the app.',
      userId: result.user.id,
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
    await prisma.users.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() }
    });

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
