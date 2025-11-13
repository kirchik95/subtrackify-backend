import type { FastifyReply, FastifyRequest } from 'fastify';

import type { LoginInput, RegisterInput } from './auth.schema.js';
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
   * Get current user profile
   */
  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get user ID from auth plugin
      const userId = request.user!.userId;

      // Fetch full user data from database
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
