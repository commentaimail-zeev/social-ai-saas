import type { FastifyInstance } from "fastify";
import { authenticateUser } from "../services/auth.service.js";

interface LoginBody {
  email: string;
  password: string;
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginBody }>("/auth/login", async (request, reply) => {
    const email = request.body?.email?.trim() ?? "";
    const password = request.body?.password ?? "";

    if (!email) {
      return reply.code(400).send({
        code: "EMAIL_REQUIRED",
      });
    }

    if (!password) {
      return reply.code(400).send({
        code: "PASSWORD_REQUIRED",
      });
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailLooksValid) {
      return reply.code(400).send({
        code: "INVALID_EMAIL",
      });
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return reply.code(401).send({
        code: "INVALID_CREDENTIALS",
      });
    }

    return reply.code(200).send({
      authenticated: true,
      user,
    });
  });
}