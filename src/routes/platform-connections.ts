import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";
import {
  requireBusinessMembership,
  requireBusinessRole,
} from "../lib/auth.js";

interface BusinessParams {
  businessId: string;
}

interface ConnectionParams {
  businessId: string;
  connectionId: string;
}

interface CreatePlatformConnectionBody {
  platform: "FACEBOOK" | "INSTAGRAM" | "GOOGLE";
  externalAccountId: string;
  externalAccountName?: string;
}

export async function platformConnectionRoutes(
  app: FastifyInstance
) {
  app.get<{ Params: BusinessParams }>(
    "/businesses/:businessId/platform-connections",
    async (request, reply) => {
      const access = await requireBusinessMembership(
        request,
        reply,
        request.params.businessId
      );

      if (!access) {
        return;
      }

      const connections =
        await prisma.platformConnection.findMany({
          where: {
            businessId: access.business.id,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

      return reply.code(200).send({
        connections,
      });
    }
  );

  app.post<{
    Params: BusinessParams;
    Body: CreatePlatformConnectionBody;
  }>(
    "/businesses/:businessId/platform-connections",
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

      const {
        platform,
        externalAccountId,
        externalAccountName,
      } = request.body ?? {};

      if (
        !["FACEBOOK", "INSTAGRAM", "GOOGLE"].includes(
          platform
        )
      ) {
        return reply.code(400).send({
          code: "INVALID_PLATFORM",
        });
      }

      const cleanExternalAccountId =
        externalAccountId?.trim() ?? "";

      if (!cleanExternalAccountId) {
        return reply.code(400).send({
          code: "EXTERNAL_ACCOUNT_ID_REQUIRED",
        });
      }

      const existingConnection =
        await prisma.platformConnection.findUnique({
          where: {
            businessId_platform_externalAccountId: {
              businessId: access.business.id,
              platform,
              externalAccountId: cleanExternalAccountId,
            },
          },
        });

      if (
        existingConnection &&
        existingConnection.status !== "DISCONNECTED"
      ) {
        return reply.code(409).send({
          code: "PLATFORM_CONNECTION_ALREADY_EXISTS",
        });
      }

      const now = new Date();

      if (existingConnection) {
        const connection =
          await prisma.platformConnection.update({
            where: {
              id: existingConnection.id,
            },
            data: {
              externalAccountName:
                externalAccountName?.trim() || null,
              status: "CONNECTED",
              connectedAt: now,
              disconnectedAt: null,
            },
          });

        return reply.code(200).send({
          connection,
          connectionMode: "SIMULATED",
        });
      }

      const connection =
        await prisma.platformConnection.create({
          data: {
            businessId: access.business.id,
            platform,
            externalAccountId:
              cleanExternalAccountId,
            externalAccountName:
              externalAccountName?.trim() || null,
            status: "CONNECTED",
            connectedAt: now,
          },
        });

      return reply.code(201).send({
        connection,
        connectionMode: "SIMULATED",
      });
    }
  );

  app.post<{ Params: ConnectionParams }>(
    "/businesses/:businessId/platform-connections/:connectionId/disconnect",
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

      const connection =
        await prisma.platformConnection.findFirst({
          where: {
            id: request.params.connectionId,
            businessId: access.business.id,
          },
        });

      if (!connection) {
        return reply.code(404).send({
          code: "PLATFORM_CONNECTION_NOT_FOUND",
        });
      }

      if (connection.status === "DISCONNECTED") {
        return reply.code(409).send({
          code: "PLATFORM_CONNECTION_ALREADY_DISCONNECTED",
        });
      }

      const updatedConnection =
        await prisma.platformConnection.update({
          where: {
            id: connection.id,
          },
          data: {
            status: "DISCONNECTED",
            disconnectedAt: new Date(),
          },
        });

      return reply.code(200).send({
        connection: updatedConnection,
      });
    }
  );
}