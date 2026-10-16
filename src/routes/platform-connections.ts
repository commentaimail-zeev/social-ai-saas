 import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";
import {
  requireBusinessMembership,
  requireBusinessRole,
} from "../lib/auth.js";

interface BusinessParams {
  businessId: string;
}

interface AuthorizationParams {
  businessId: string;
  authorizationId: string;
}

interface CreateAuthorizationBody {
  provider: "META" | "GOOGLE";
  externalUserId: string;
  externalUserName?: string;
}

interface AddPlatformAccountBody {
  platform: "FACEBOOK" | "INSTAGRAM" | "GOOGLE";
  externalAccountId: string;
  externalAccountName?: string;
}

function platformMatchesProvider(
  provider: "META" | "GOOGLE",
  platform: "FACEBOOK" | "INSTAGRAM" | "GOOGLE"
) {
  if (provider === "META") {
    return platform === "FACEBOOK" || platform === "INSTAGRAM";
  }

  return platform === "GOOGLE";
}

export async function platformConnectionRoutes(
  app: FastifyInstance
) {
  app.get<{ Params: BusinessParams }>(
    "/businesses/:businessId/platform-authorizations",
    async (request, reply) => {
      const access = await requireBusinessMembership(
        request,
        reply,
        request.params.businessId
      );

      if (!access) {
        return;
      }

      const authorizations =
        await prisma.platformAuthorization.findMany({
          where: {
            businessId: access.business.id,
          },
          include: {
            accounts: {
              orderBy: {
                selectedAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

      return reply.code(200).send({
        authorizations,
      });
    }
  );

  app.post<{
    Params: BusinessParams;
    Body: CreateAuthorizationBody;
  }>(
    "/businesses/:businessId/platform-authorizations",
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
        provider,
        externalUserId,
        externalUserName,
      } = request.body ?? {};

      if (!["META", "GOOGLE"].includes(provider)) {
        return reply.code(400).send({
          code: "INVALID_PLATFORM_PROVIDER",
        });
      }

      const cleanExternalUserId =
        externalUserId?.trim() ?? "";

      if (!cleanExternalUserId) {
        return reply.code(400).send({
          code: "EXTERNAL_USER_ID_REQUIRED",
        });
      }

      const existingAuthorization =
        await prisma.platformAuthorization.findFirst({
          where: {
            businessId: access.business.id,
            provider,
            externalUserId: cleanExternalUserId,
          },
        });

      if (
        existingAuthorization &&
        existingAuthorization.status !== "DISCONNECTED"
      ) {
        return reply.code(409).send({
          code: "PLATFORM_AUTHORIZATION_ALREADY_EXISTS",
        });
      }

      const now = new Date();

      if (existingAuthorization) {
        const authorization =
          await prisma.platformAuthorization.update({
            where: {
              id: existingAuthorization.id,
            },
            data: {
              status: "CONNECTED",
              externalUserName:
                externalUserName?.trim() || null,
              connectedAt: now,
              disconnectedAt: null,
            },
          });

        return reply.code(200).send({
          authorization,
          authorizationMode: "SIMULATED",
        });
      }

      const authorization =
        await prisma.platformAuthorization.create({
          data: {
            businessId: access.business.id,
            provider,
            status: "CONNECTED",
            externalUserId: cleanExternalUserId,
            externalUserName:
              externalUserName?.trim() || null,
            connectedAt: now,
          },
        });

      return reply.code(201).send({
        authorization,
        authorizationMode: "SIMULATED",
      });
    }
  );

  app.post<{
    Params: AuthorizationParams;
    Body: AddPlatformAccountBody;
  }>(
    "/businesses/:businessId/platform-authorizations/:authorizationId/accounts",
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

      const authorization =
        await prisma.platformAuthorization.findFirst({
          where: {
            id: request.params.authorizationId,
            businessId: access.business.id,
          },
        });

      if (!authorization) {
        return reply.code(404).send({
          code: "PLATFORM_AUTHORIZATION_NOT_FOUND",
        });
      }

      if (authorization.status !== "CONNECTED") {
        return reply.code(409).send({
          code: "PLATFORM_AUTHORIZATION_NOT_CONNECTED",
        });
      }

      if (
        !platformMatchesProvider(
          authorization.provider,
          platform
        )
      ) {
        return reply.code(400).send({
          code: "PLATFORM_PROVIDER_MISMATCH",
        });
      }

      const existingAccount =
        await prisma.platformAccount.findUnique({
          where: {
            businessId_platform_externalAccountId: {
              businessId: access.business.id,
              platform,
              externalAccountId: cleanExternalAccountId,
            },
          },
        });

      if (existingAccount) {
        if (
          existingAccount.authorizationId !==
          authorization.id
        ) {
          return reply.code(409).send({
            code: "PLATFORM_ACCOUNT_AUTHORIZATION_CONFLICT",
          });
        }

        const account =
          await prisma.platformAccount.update({
            where: {
              id: existingAccount.id,
            },
            data: {
              externalAccountName:
                externalAccountName?.trim() || null,
              isActive: true,
              selectedAt: new Date(),
            },
          });

        return reply.code(200).send({
          account,
          accountMode: "SIMULATED",
        });
      }

      const account =
        await prisma.platformAccount.create({
          data: {
            businessId: access.business.id,
            authorizationId: authorization.id,
            platform,
            externalAccountId:
              cleanExternalAccountId,
            externalAccountName:
              externalAccountName?.trim() || null,
          },
        });

      return reply.code(201).send({
        account,
        accountMode: "SIMULATED",
      });
    }
  );

  app.post<{ Params: AuthorizationParams }>(
    "/businesses/:businessId/platform-authorizations/:authorizationId/disconnect",
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

      const authorization =
        await prisma.platformAuthorization.findFirst({
          where: {
            id: request.params.authorizationId,
            businessId: access.business.id,
          },
        });

      if (!authorization) {
        return reply.code(404).send({
          code: "PLATFORM_AUTHORIZATION_NOT_FOUND",
        });
      }

      if (authorization.status === "DISCONNECTED") {
        return reply.code(409).send({
          code: "PLATFORM_AUTHORIZATION_ALREADY_DISCONNECTED",
        });
      }

      const updatedAuthorization =
        await prisma.platformAuthorization.update({
          where: {
            id: authorization.id,
          },
          data: {
            status: "DISCONNECTED",
            disconnectedAt: new Date(),
          },
        });

      return reply.code(200).send({
        authorization: updatedAuthorization,
      });
    }
  );
}