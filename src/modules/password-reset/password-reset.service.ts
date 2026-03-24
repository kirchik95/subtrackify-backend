import crypto from 'node:crypto';

import prisma from '@db/prisma.js';
import bcrypt from 'bcrypt';

import { sendEmail } from '@/utils/email.js';

const SALT_ROUNDS = 10;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export class PasswordResetService {
  /**
   * Initiate password reset flow
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return generic message for security
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Invalidate existing tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Create new token (expires in 1 hour)
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    // Send reset email
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail(
      email,
      'Password Reset - Subtrackify',
      `<p>You requested a password reset.</p>
       <p>Click the link below to reset your password:</p>
       <p><a href="${resetLink}">${resetLink}</a></p>
       <p>This link expires in 1 hour.</p>
       <p>If you did not request this, please ignore this email.</p>`
    );

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Validate token
    if (!tokenRecord || tokenRecord.expiresAt <= new Date() || tokenRecord.usedAt !== null) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password has been reset successfully.' };
  }
}

export const passwordResetService = new PasswordResetService();
