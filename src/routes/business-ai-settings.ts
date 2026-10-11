import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";
import {
  requireBusinessMembership,
  requireBusinessRole,
} from "../lib/auth.js";

interface BusinessParams {
  businessId: string;
}

interface UpdateAiSettingsBody {
  replyLanguageMode?: "MATCH_CUSTOMER" | "FIXED";
  defaultReplyLanguage?: string;
  replyTone?: "BALANCED" | "FRIENDLY" | "PROFESSIONAL";
  replyMode?: "REVIEW_REQUIRED" | "AUTOMATIC";
  customInstructions?: string | null;
}

export async function businessAiSettingsRoutes(app: FastifyInstance) {
  app.get<{ Params: BusinessParams }>(
    "/businesses/:businessId/ai-settings",
    async (request, reply) => {
      const access = await requireBusinessMembership(
        request,
        reply,
        request.params.businessId
      );

      if (!access) {
        return;
      }

      const settings = await prisma.businessAiSettings.upsert({
        where: {
          businessId: access.business.id,
        },
        update: {},
        create: {
          businessId: access.business.id,
        },
      });

      return reply.code(200).send({
        settings,
      });
    }
  );

  app.patch<{
    Params: BusinessParams;
    Body: UpdateAiSettingsBody;
  }>(
    "/businesses/:businessId/ai-settings",
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
        replyLanguageMode,
        defaultReplyLanguage,
        replyTone,
        replyMode,
        customInstructions,
      } = request.body ?? {};

      if (
        replyLanguageMode &&
        !["MATCH_CUSTOMER", "FIXED"].includes(replyLanguageMode)
      ) {
        return reply.code(400).send({
          code: "INVALID_REPLY_LANGUAGE_MODE",
        });
      }

      if (
        replyTone &&
        !["BALANCED", "FRIENDLY", "PROFESSIONAL"].includes(replyTone)
      ) {
        return reply.code(400).send({
          code: "INVALID_REPLY_TONE",
        });
      }

      if (
        replyMode &&
        !["REVIEW_REQUIRED", "AUTOMATIC"].includes(replyMode)
      ) {
        return reply.code(400).send({
          code: "INVALID_REPLY_MODE",
        });
      }

      const normalizedLanguage = defaultReplyLanguage
        ?.trim()
        .toLowerCase();

      if (
        normalizedLanguage &&
        !/^[a-z]{2,3}(-[a-z]{2})?$/.test(normalizedLanguage)
      ) {
        return reply.code(400).send({
          code: "INVALID_REPLY_LANGUAGE",
        });
      }

      const settings = await prisma.businessAiSettings.upsert({
        where: {
          businessId: access.business.id,
        },
        update: {
          ...(replyLanguageMode !== undefined && {
            replyLanguageMode,
          }),
          ...(normalizedLanguage !== undefined && {
            defaultReplyLanguage: normalizedLanguage,
          }),
          ...(replyTone !== undefined && {
            replyTone,
          }),
          ...(replyMode !== undefined && {
            replyMode,
          }),
          ...(customInstructions !== undefined && {
            customInstructions:
              customInstructions?.trim() || null,
          }),
        },
        create: {
          businessId: access.business.id,
          ...(replyLanguageMode !== undefined && {
            replyLanguageMode,
          }),
          ...(normalizedLanguage !== undefined && {
            defaultReplyLanguage: normalizedLanguage,
          }),
          ...(replyTone !== undefined && {
            replyTone,
          }),
          ...(replyMode !== undefined && {
            replyMode,
          }),
          ...(customInstructions !== undefined && {
            customInstructions:
              customInstructions?.trim() || null,
          }),
        },
      });

      return reply.code(200).send({
        settings,
      });
    }
  );
}