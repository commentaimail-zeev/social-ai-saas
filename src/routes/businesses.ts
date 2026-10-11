 import type { FastifyInstance } from "fastify";

import {
  requireAuthenticatedUser,
  requireBusinessMembership,
} from "../lib/auth.js";

interface BusinessParams {
  businessId: string;
}

export async function businessRoutes(app: FastifyInstance) {
  app.get("/businesses", async (request, reply) => {
    const user = await requireAuthenticatedUser(request, reply);

    if (!user) {
      return;
    }

    const businesses = user.memberships.map((membership) => ({
      id: membership.business.id,
      name: membership.business.name,
      role: membership.role,
    }));

    return reply.code(200).send({
      businesses,
    });
  });

  app.get<{ Params: BusinessParams }>(
    "/businesses/:businessId",
    async (request, reply) => {
      const access = await requireBusinessMembership(
        request,
        reply,
        request.params.businessId
      );

      if (!access) {
        return;
      }

      return reply.code(200).send({
        business: {
          id: access.business.id,
          name: access.business.name,
          role: access.membership.role,
        },
      });
    }
  );
}