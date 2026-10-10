 import type { FastifyInstance } from "fastify";

import { authenticateUser } from "../services/auth.service.js";
import {
  createSession,
  deleteSession,
  getUserFromSessionToken,
} from "../services/session.service.js";

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

    const session = await createSession(user.id);

    reply.setCookie("social_ai_session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: session.expiresAt,
    });

    return reply.code(200).send({
      authenticated: true,
      user,
    });
  });

  app.get("/auth/me", async (request, reply) => {
    const token = request.cookies.social_ai_session;

    if (!token) {
      return reply.code(401).send({
        code: "UNAUTHENTICATED",
      });
    }

    const user = await getUserFromSessionToken(token);

    if (!user) {
      return reply.code(401).send({
        code: "UNAUTHENTICATED",
      });
    }

    return reply.code(200).send({
      authenticated: true,
      user,
    });
  });

  app.post("/auth/logout", async (request, reply) => {
    const token = request.cookies.social_ai_session;

    if (token) {
      await deleteSession(token);
    }

    reply.clearCookie("social_ai_session", {
      path: "/",
    });

    return reply.code(200).send({
      authenticated: false,
    });
  });
}