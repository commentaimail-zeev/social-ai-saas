import type {
  CustomerInteraction,
  SocialPlatform,
} from "../../generated/prisma/client.js";

interface PublishResult {
  publishedAt: Date;
}

async function publishToPlatform(
  platform: SocialPlatform,
  interaction: CustomerInteraction
): Promise<PublishResult> {
  switch (platform) {
    case "GOOGLE":
    case "FACEBOOK":
    case "INSTAGRAM":
      /*
       * Development simulation only.
       *
       * Later, each platform will call its own real publisher:
       * - Google Business API
       * - Meta Graph API for Facebook
       * - Meta Graph API for Instagram
       */
      return {
        publishedAt: new Date(),
      };

    default: {
      const exhaustiveCheck: never = platform;
      throw new Error(
        `UNSUPPORTED_PLATFORM: ${exhaustiveCheck}`
      );
    }
  }
}

export async function publishInteractionReply(
  interaction: CustomerInteraction
) {
  if (interaction.replyStatus !== "READY_TO_PUBLISH") {
    throw new Error("INTERACTION_NOT_READY_TO_PUBLISH");
  }

  if (!interaction.finalReply?.trim()) {
    throw new Error("FINAL_REPLY_MISSING");
  }

  return publishToPlatform(
    interaction.platform,
    interaction
  );
}
