 import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";
import {
  requireAuthenticatedUser,
  requireBusinessMembership,
  requireBusinessRole,
} from "../lib/auth.js";

interface BusinessParams {
  businessId: string;
}

interface UpdateBusinessBody {
  name: string;
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

  app.patch<{
    Params: BusinessParams;
    Body: UpdateBusinessBody;
  }>(
    "/businesses/:businessId",
    async (request, reply) => {
      const access = await requireBusinessRole(
        request,
        reply,
        request.params.businessId,
        ["OWNER", "ADMIN"]
      );

      if (!access) {
        return;
      }

      const name = request.body?.name?.trim() ?? "";

      if (!name) {
        return reply.code(400).send({
          code: "BUSINESS_NAME_REQUIRED",
        });
      }

      const business = await prisma.business.update({
        where: {
          id: access.business.id,
        },
        data: {
          name,
        },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
      });

      return reply.code(200).send({
        business,
      });
    }
  );
}