 import Fastify from "fastify";
import cookie from "@fastify/cookie";

import { healthRoutes } from "./routes/health.js";
import { onboardingRoutes } from "./routes/onboarding.js";
import { authRoutes } from "./routes/auth.js";
import { businessRoutes } from "./routes/businesses.js";
import { businessAiSettingsRoutes } from "./routes/business-ai-settings.js";
import { aiReplyRoutes } from "./routes/ai-replies.js";
import { interactionRoutes } from "./routes/interactions.js";
import { platformConnectionRoutes } from "./routes/platform-connections.js";

export function buildApp() {
  const app = Fastify();

  app.register(cookie);

  app.get("/", async () => {
    return "השרת עובד";
  });

  app.register(healthRoutes);
  app.register(onboardingRoutes);
  app.register(authRoutes);
  app.register(businessRoutes);
  app.register(businessAiSettingsRoutes);
  app.register(aiReplyRoutes);
  app.register(interactionRoutes);
  app.register(platformConnectionRoutes);

  return app;
}