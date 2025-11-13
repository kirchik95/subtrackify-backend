import type { FastifyInstance } from 'fastify';

import { profileController } from './profile.controller.js';
import { changePasswordJsonSchema, updateProfileJsonSchema } from './profile.schema.js';

export async function profileRoutes(fastify: FastifyInstance) {
  // Get profile
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
    },
    profileController.getProfile.bind(profileController)
  );

  // Update profile
  fastify.put(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: updateProfileJsonSchema,
      },
    },
    profileController.updateProfile.bind(profileController)
  );

  // Change password
  fastify.post(
    '/change-password',
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: changePasswordJsonSchema,
      },
    },
    profileController.changePassword.bind(profileController)
  );

  // Delete account
  fastify.delete(
    '/',
    {
      onRequest: [fastify.authenticate],
    },
    profileController.deleteAccount.bind(profileController)
  );
}
