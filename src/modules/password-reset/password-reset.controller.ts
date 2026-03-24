import type { FastifyReply, FastifyRequest } from 'fastify';

import type { ForgotPasswordInput, ResetPasswordInput } from './password-reset.schema.js';
import { passwordResetService } from './password-reset.service.js';

export class PasswordResetController {
  /**
   * Handle forgot password request
   */
  async forgotPassword(
    request: FastifyRequest<{ Body: ForgotPasswordInput }>,
    reply: FastifyReply
  ) {
    try {
      const { email } = request.body;
      const result = await passwordResetService.forgotPassword(email);
      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      request.log.error(error);
      // Always return 200 for security - don't reveal email existence
      return reply.status(200).send({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }
  }

  /**
   * Handle password reset
   */
  async resetPassword(request: FastifyRequest<{ Body: ResetPasswordInput }>, reply: FastifyReply) {
    try {
      const { token, newPassword } = request.body;
      const result = await passwordResetService.resetPassword(token, newPassword);
      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Password reset failed';
      return reply.status(400).send({
        success: false,
        error: message,
      });
    }
  }
}

export const passwordResetController = new PasswordResetController();
