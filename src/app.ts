 import Fastify from "fastify";
import { healthRoutes } from "./routes/health.js";
import { onboardingRoutes } from "./routes/onboarding.js";

export function buildApp() {
  const app = Fastify();

  app.get("/", async () => {
    return "השרת עובד";
  });

  app.register(healthRoutes);
  app.register(onboardingRoutes);

  return app;
}