 import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";
import { requireBusinessMembership } from "../lib/auth.js";
import { generateAiReply } from "../services/ai-reply.service.js";

interface BusinessParams {
  businessId: string;
}

interface InteractionParams {
  businessId: string;
  interactionId: string;
}

interface CreateInteractionBody {
  platform: "FACEBOOK" | "INSTAGRAM" | "GOOGLE";
  type: "COMMENT" | "REVIEW";
  externalId: string;

  customerName?: string;
  customerExternalId?: string;

  text: string;
  rating?: number;
}

export async function interactionRoutes(app: FastifyInstance) {
  app.post<{
    Params: BusinessParams;
    Body: CreateInteractionBody;
  }>(
    "/businesses/:businessId/interactions",
    async (request, reply) => {
      const access = await requireBusinessMembership(
        request,
        reply,
        request.params.businessId
      );

      if (!access) {
        return;
      }

      const {
        platform,
        type,
        externalId,
        customerName,
        customerExternalId,
        text,
        rating,
      } = request.body ?? {};

      if (!["FACEBOOK", "INSTAGRAM", "GOOGLE"].includes(platform)) {
        return reply.code(400).send({
          code: "INVALID_PLATFORM",
        });
      }

      if (!["COMMENT", "REVIEW"].includes(type)) {
        return reply.code(400).send({
          code: "INVALID_INTERACTION_TYPE",
        });
      }

      const cleanExternalId = externalId?.trim() ?? "";
      const cleanText = text?.trim() ?? "";

      if (!cleanExternalId) {
        return reply.code(400).send({
          code: "EXTERNAL_ID_REQUIRED",
        });
      }

      if (!cleanText) {
        return reply.code(400).send({
          code: "INTERACTION_TEXT_REQUIRED",
        });
      }

      if (
        rating !== undefined &&
        (!Number.isInteger(rating) || rating < 1 || rating > 5)
      ) {
        return reply.code(400).send({
          code: "INVALID_RATING",
        });
      }

      const existingInteraction =
        await prisma.customerInteraction.findUnique({
          where: {
            businessId_platform_externalId: {
              businessId: access.business.id,
              platform,
              externalId: cleanExternalId,
            },
          },
        });

      if (existingInteraction) {
        return reply.code(409).send({
          code: "INTERACTION_ALREADY_EXISTS",
        });
      }

      const interaction = await prisma.customerInteraction.create({
        data: {
          businessId: access.business.id,
          platform,
          type,
          externalId: cleanExternalId,

          customerName: customerName?.trim() || null,
          customerExternalId:
            customerExternalId?.trim() || null,

          text: cleanText,
          rating: rating ?? null,
        },
      });

      return reply.code(201).send({
        interaction,
      });
    }
  );

  app.get<{ Params: BusinessParams }>(
    "/businesses/:businessId/interactions",
    async (request, reply) => {
      const access = await requireBusinessMembership(
        request,
        reply,
        request.params.businessId
      );

      if (!access) {
        return;
      }

      const interactions =
        await prisma.customerInteraction.findMany({
          where: {
            businessId: access.business.id,
          },
          orderBy: {
            receivedAt: "desc",
          },
        });

      return reply.code(200).send({
        interactions,
      });
    }
  );

  app.post<{ Params: InteractionParams }>(
    "/businesses/:businessId/interactions/:interactionId/generate-reply",
    async (request, reply) => {
      const access = await requireBusinessMembership(
        request,
        reply,
        request.params.businessId
      );

      if (!access) {
        return;
      }

      const interaction =
        await prisma.customerInteraction.findFirst({
          where: {
            id: request.params.interactionId,
            businessId: access.business.id,
          },
        });

      if (!interaction) {
        return reply.code(404).send({
          code: "INTERACTION_NOT_FOUND",
        });
      }

      try {
        const result = await generateAiReply({
          businessId: access.business.id,
          customerText: interaction.text,
          customerName: interaction.customerName,
          rating: interaction.rating,
        });

        const nextStatus =
          result.settings.replyMode === "AUTOMATIC"
            ? "READY_TO_PUBLISH"
            : "PENDING_REVIEW";

        const updatedInteraction =
          await prisma.customerInteraction.update({
            where: {
              id: interaction.id,
            },
            data: {
              suggestedReply: result.reply,
              aiModel: result.model,
              replyStatus: nextStatus,
            },
          });

        return reply.code(200).send({
          interaction: updatedInteraction,
        });
      } catch (error) {
        request.log.error(error);

        await prisma.customerInteraction.update({
          where: {
            id: interaction.id,
          },
          data: {
            replyStatus: "FAILED",
          },
        });

        return reply.code(500).send({
          code: "AI_REPLY_GENERATION_FAILED",
        });
      }
    }
  );
}