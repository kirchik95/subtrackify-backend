import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  GoogleAuthInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  VerifyEmailInput,
} from './auth.schema.js';
import { authService } from './auth.service.js';

export class AuthController {
  /**
   * Register a new user
   */
  async register(request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) {
    try {
      const result = await authService.register(request.body);
      return reply.status(201).send({
        success: true,
        data: result,
        message: 'User registered successfully',
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      return reply.status(400).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Login user
   */
  async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    try {
      const result = await authService.login(request.body);
      return reply.status(200).send({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Login failed';
      return reply.status(401).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Google OAuth
   */
  async googleAuth(request: FastifyRequest<{ Body: GoogleAuthInput }>, reply: FastifyReply) {
    try {
      const result = await authService.googleAuth(request.body.accessToken);
      return reply.status(200).send({
        success: true,
        data: result,
        message: 'Google authentication successful',
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Google authentication failed';
      return reply.status(401).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Send verification email
   */
  async sendVerification(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const email = request.user!.email;
      await authService.sendVerificationEmail(userId, email);
      return reply.status(200).send({
        success: true,
        message: 'Verification email sent',
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to send verification email';
      return reply.status(400).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(request: FastifyRequest<{ Body: VerifyEmailInput }>, reply: FastifyReply) {
    try {
      const result = await authService.verifyEmail(request.body.token);
      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Email verification failed';
      return reply.status(400).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Refresh access token
   */
  async refresh(request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply) {
    try {
      const result = await authService.refresh(request.body.refreshToken);
      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      return reply.status(401).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Logout — invalidate refresh token
   */
  async logout(request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply) {
    try {
      await authService.logout(request.body.refreshToken);
      return reply.status(200).send({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(200).send({
        success: true,
        message: 'Logged out successfully',
      });
    }
  }

  /**
   * Get current user profile
   */
  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const user = await authService.getUserById(userId);

      return reply.status(200).send({
        success: true,
        data: user,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to fetch user';
      return reply.status(401).send({
        success: false,
        error: message,
      });
    }
  }
}

export const authController = new AuthController();
