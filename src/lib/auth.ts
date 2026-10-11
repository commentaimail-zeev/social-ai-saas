 import type { FastifyReply, FastifyRequest } from "fastify";

import { getUserFromSessionToken } from "../services/session.service.js";

type BusinessRole = "OWNER" | "ADMIN" | "MEMBER";

export async function requireAuthenticatedUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.cookies.social_ai_session;

  if (!token) {
    reply.code(401).send({
      code: "UNAUTHENTICATED",
    });

    return null;
  }

  const user = await getUserFromSessionToken(token);

  if (!user) {
    reply.clearCookie("social_ai_session", {
      path: "/",
    });

    reply.code(401).send({
      code: "UNAUTHENTICATED",
    });

    return null;
  }

  return user;
}

export async function requireBusinessMembership(
  request: FastifyRequest,
  reply: FastifyReply,
  businessId: string
) {
  const user = await requireAuthenticatedUser(request, reply);

  if (!user) {
    return null;
  }

  const membership = user.memberships.find(
    (membership) => membership.business.id === businessId
  );

  if (!membership) {
    reply.code(404).send({
      code: "BUSINESS_NOT_FOUND",
    });

    return null;
  }

  return {
    user,
    membership,
    business: membership.business,
  };
}

export async function requireBusinessRole(
  request: FastifyRequest,
  reply: FastifyReply,
  businessId: string,
  allowedRoles: readonly BusinessRole[]
) {
  const access = await requireBusinessMembership(
    request,
    reply,
    businessId
  );

  if (!access) {
    return null;
  }

  if (!allowedRoles.includes(access.membership.role as BusinessRole)) {
    reply.code(403).send({
      code: "INSUFFICIENT_PERMISSIONS",
    });

    return null;
  }

  return access;
}