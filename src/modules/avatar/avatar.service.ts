import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import prisma from '@db/prisma.js';

const UPLOADS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  'uploads',
  'avatars'
);

export class AvatarService {
  /**
   * Upload avatar for a user
   */
  async uploadAvatar(
    userId: number,
    fileBuffer: Buffer,
    mimetype: string
  ): Promise<{ avatarUrl: string }> {
    // Determine file extension from mimetype
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const ext = extMap[mimetype];

    // Generate unique filename
    const filename = `avatar-${userId}-${Date.now()}.${ext}`;

    // Ensure uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    // Get current user to check for existing avatar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    // If existing avatar, try to delete old file
    if (user?.avatarUrl) {
      try {
        const oldFilePath = path.join(UPLOADS_DIR, '..', '..', user.avatarUrl);
        await fs.unlink(oldFilePath);
      } catch {
        // Ignore errors if file not found
      }
    }

    // Write new file to disk
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filePath, fileBuffer);

    // Update user in database
    const avatarUrl = '/uploads/avatars/' + filename;
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return { avatarUrl };
  }

  /**
   * Delete avatar for a user
   */
  async deleteAvatar(userId: number): Promise<{ message: string }> {
    // Get user to check if avatar exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    // If avatar exists, try to delete file from disk
    if (user?.avatarUrl) {
      try {
        const filePath = path.join(UPLOADS_DIR, '..', '..', user.avatarUrl);
        await fs.unlink(filePath);
      } catch {
        // Ignore errors if file not found
      }
    }

    // Update user: remove avatar URL
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    return { message: 'Avatar deleted successfully' };
  }
}

export const avatarService = new AvatarService();
