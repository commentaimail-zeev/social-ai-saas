 import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.get("/health/db", async () => {
    const [userCount, businessCount, membershipCount] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.membership.count(),
    ]);

    return {
      status: "ok",
      database: "connected",
      userCount,
      businessCount,
      membershipCount,
    };
  });
}