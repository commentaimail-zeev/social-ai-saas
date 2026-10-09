 import type { FastifyInstance } from "fastify";
import { createBusinessAccount } from "../services/onboarding.service.js";

interface OnboardingBody {
  email: string;
  password: string;
  name?: string;
  businessName: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onboardingRoutes(app: FastifyInstance) {
  app.post<{ Body: OnboardingBody }>("/onboarding", async (request, reply) => {
    const email = request.body.email?.trim();
    const password = request.body.password;
    const name = request.body.name?.trim();
    const businessName = request.body.businessName?.trim();

    if (!email) {
      return reply.status(400).send({
        code: "EMAIL_REQUIRED",
      });
    }

    if (!businessName) {
      return reply.status(400).send({
        code: "BUSINESS_NAME_REQUIRED",
      });
    }

    if (!password) {
      return reply.status(400).send({
        code: "PASSWORD_REQUIRED",
      });
    }

    if (password.length < 8) {
      return reply.status(400).send({
        code: "PASSWORD_TOO_SHORT",
      });
    }

    if (!isValidEmail(email)) {
      return reply.status(400).send({
        code: "INVALID_EMAIL",
      });
    }

    try {
      const result = await createBusinessAccount({
        email,
        password,
        businessName,
        ...(name ? { name } : {}),
      });

      return reply.status(201).send(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "EMAIL_ALREADY_EXISTS"
      ) {
        return reply.status(409).send({
          code: "EMAIL_ALREADY_EXISTS",
        });
      }

      throw error;
    }
  });
}