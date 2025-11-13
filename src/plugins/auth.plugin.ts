import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { authService } from '@modules/auth/auth.service.js';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: number;
      email: string;
    };
  }
}

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.status(401).send({
          success: false,
          error: 'No authorization header provided',
        });
      }

      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        return reply.status(401).send({
          success: false,
          error: 'No token provided',
        });
      }

      const decoded = authService.verifyToken(token);
      request.user = decoded;
    } catch {
      return reply.status(401).send({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  });
}

export default fp(authPlugin);
