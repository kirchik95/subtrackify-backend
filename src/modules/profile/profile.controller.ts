import type { FastifyReply, FastifyRequest } from 'fastify';

import type { ChangePasswordInput, UpdateProfileInput } from './profile.schema.js';
import { profileService } from './profile.service.js';

export class ProfileController {
  /**
   * Get user profile
   */
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const profile = await profileService.getProfile(userId);

      return reply.status(200).send({
        success: true,
        data: profile,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(404).send({
        success: false,
        error: 'Profile not found',
      });
    }
  }

  /**
   * Update profile
   */
  async updateProfile(request: FastifyRequest<{ Body: UpdateProfileInput }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const profile = await profileService.updateProfile(userId, request.body);

      return reply.status(200).send({
        success: true,
        data: profile,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      return reply.status(400).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(
    request: FastifyRequest<{ Body: ChangePasswordInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.userId;
      const result = await profileService.changePassword(userId, request.body);

      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to change password';
      return reply.status(400).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const result = await profileService.deleteAccount(userId);

      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete account',
      });
    }
  }
}

export const profileController = new ProfileController();
