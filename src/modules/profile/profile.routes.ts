import type { FastifyInstance } from 'fastify';

import { profileController } from './profile.controller.js';
import { changePasswordSchema, updateProfileSchema } from './profile.schema.js';

export async function profileRoutes(fastify: FastifyInstance) {
  // Get profile
  fastify.get('/', profileController.getProfile.bind(profileController));

  // Update profile
  fastify.put(
    '/',
    {
      schema: {
        body: updateProfileSchema,
      },
    },
    profileController.updateProfile.bind(profileController)
  );

  // Change password
  fastify.post(
    '/change-password',
    {
      schema: {
        body: changePasswordSchema,
      },
    },
    profileController.changePassword.bind(profileController)
  );

  // Delete account
  fastify.delete('/', profileController.deleteAccount.bind(profileController));
}
