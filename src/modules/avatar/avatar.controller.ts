import type { FastifyReply, FastifyRequest } from 'fastify';

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './avatar.schema.js';
import { avatarService } from './avatar.service.js';

export class AvatarController {
  /**
   * Upload avatar
   */
  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const file = await request.file();

      if (!file) {
        return reply.status(400).send({
          success: false,
          error: 'No file uploaded',
        });
      }

      // Check mime type
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid file type. Allowed types: JPEG, PNG, WebP',
        });
      }

      // Read file buffer
      const buffer = await file.toBuffer();

      // Check file size
      if (buffer.length > MAX_FILE_SIZE) {
        return reply.status(400).send({
          success: false,
          error: 'File too large. Maximum size is 5MB',
        });
      }

      const userId = request.user!.userId;
      const result = await avatarService.uploadAvatar(userId, buffer, file.mimetype);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to upload avatar';
      return reply.status(500).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const result = await avatarService.deleteAvatar(userId);

      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to delete avatar';
      return reply.status(500).send({
        success: false,
        error: message,
      });
    }
  }
}

export const avatarController = new AvatarController();
