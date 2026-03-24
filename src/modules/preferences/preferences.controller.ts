import type { FastifyReply, FastifyRequest } from 'fastify';

import type { UpdatePreferencesInput } from './preferences.schema.js';
import { preferencesService } from './preferences.service.js';

export class PreferencesController {
  async getPreferences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const data = await preferencesService.getPreferences(userId);
      return reply.status(200).send({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get preferences';
      return reply.status(500).send({ success: false, error: message });
    }
  }

  async updatePreferences(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const data = await preferencesService.updatePreferences(
        userId,
        request.body as UpdatePreferencesInput
      );
      return reply.status(200).send({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update preferences';
      return reply.status(500).send({ success: false, error: message });
    }
  }
}

export const preferencesController = new PreferencesController();
