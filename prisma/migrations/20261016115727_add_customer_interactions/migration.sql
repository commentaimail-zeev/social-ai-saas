-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'GOOGLE');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('COMMENT', 'REVIEW');

-- CreateEnum
CREATE TYPE "ReplyStatus" AS ENUM ('PENDING_GENERATION', 'PENDING_REVIEW', 'READY_TO_PUBLISH', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "CustomerInteraction" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "type" "InteractionType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "customerName" TEXT,
    "customerExternalId" TEXT,
    "text" TEXT NOT NULL,
    "rating" INTEGER,
    "suggestedReply" TEXT,
    "finalReply" TEXT,
    "aiModel" TEXT,
    "replyStatus" "ReplyStatus" NOT NULL DEFAULT 'PENDING_GENERATION',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerInteraction_businessId_receivedAt_idx" ON "CustomerInteraction"("businessId", "receivedAt");

-- CreateIndex
CREATE INDEX "CustomerInteraction_replyStatus_idx" ON "CustomerInteraction"("replyStatus");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInteraction_businessId_platform_externalId_key" ON "CustomerInteraction"("businessId", "platform", "externalId");

-- AddForeignKey
ALTER TABLE "CustomerInteraction" ADD CONSTRAINT "CustomerInteraction_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
