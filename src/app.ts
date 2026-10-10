 import Fastify from "fastify";
import { healthRoutes } from "./routes/health.js";
import { onboardingRoutes } from "./routes/onboarding.js";
import { authRoutes } from "./routes/auth.js";
export function buildApp() {
  const app = Fastify();

  app.get("/", async () => {
    return "השרת עובד";
  });

  app.register(healthRoutes);
  app.register(onboardingRoutes);
app.register(authRoutes);
  return app;
}