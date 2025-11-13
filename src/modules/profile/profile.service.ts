import prisma from '@db/prisma.js';
import bcrypt from 'bcrypt';

import type { ChangePasswordInput, UpdateProfileInput } from './profile.schema.js';

const SALT_ROUNDS = 10;

export class ProfileService {
  /**
   * Get user profile
   */
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, data: UpdateProfileInput) {
    // Check if email is already taken by another user
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new Error('Email is already taken');
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Change password
   */
  async changePassword(userId: number, data: ChangePasswordInput) {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Delete account
   */
  async deleteAccount(userId: number) {
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }
}

export const profileService = new ProfileService();
