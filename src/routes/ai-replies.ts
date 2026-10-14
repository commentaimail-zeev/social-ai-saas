import type { FastifyInstance } from "fastify";

import { requireBusinessMembership } from "../lib/auth.js";
import { generateAiReply } from "../services/ai-reply.service.js";

interface BusinessParams {
  businessId: string;
}

interface GenerateReplyBody {
  customerText: string;
}

export async function aiReplyRoutes(app: FastifyInstance) {
  app.post<{
    Params: BusinessParams;
    Body: GenerateReplyBody;
  }>(
    "/businesses/:businessId/ai-replies/generate",
    async (request, reply) => {
      const access = await requireBusinessMembership(
        request,
        reply,
        request.params.businessId
      );

      if (!access) {
        return;
      }

      const customerText = request.body?.customerText?.trim() ?? "";

      if (!customerText) {
        return reply.code(400).send({
          code: "CUSTOMER_TEXT_REQUIRED",
        });
      }

      try {
        const result = await generateAiReply({
          businessId: access.business.id,
          customerText,
        });

        return reply.code(200).send({
          suggestion: result.reply,
          model: result.model,
          settings: result.settings,
        });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "OPENAI_API_KEY_MISSING"
        ) {
          return reply.code(503).send({
            code: "AI_SERVICE_NOT_CONFIGURED",
          });
        }

        request.log.error(error);

        return reply.code(500).send({
          code: "AI_REPLY_GENERATION_FAILED",
        });
      }
    }
  );
}