/*
  Warnings:

  - You are about to drop the `PlatformConnection` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PlatformProvider" AS ENUM ('META', 'GOOGLE');

-- CreateEnum
CREATE TYPE "PlatformAuthorizationStatus" AS ENUM ('PENDING', 'CONNECTED', 'REAUTH_REQUIRED', 'DISCONNECTED', 'ERROR');

-- DropForeignKey
ALTER TABLE "PlatformConnection" DROP CONSTRAINT "PlatformConnection_businessId_fkey";

-- AlterTable
ALTER TABLE "CustomerInteraction" ADD COLUMN     "platformAccountId" TEXT;

-- DropTable
DROP TABLE "PlatformConnection";

-- DropEnum
DROP TYPE "PlatformConnectionStatus";

-- CreateTable
CREATE TABLE "PlatformAuthorization" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "provider" "PlatformProvider" NOT NULL,
    "status" "PlatformAuthorizationStatus" NOT NULL DEFAULT 'PENDING',
    "externalUserId" TEXT,
    "externalUserName" TEXT,
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "lastRefreshAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformAccount" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "authorizationId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "externalAccountName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformAuthorization_businessId_idx" ON "PlatformAuthorization"("businessId");

-- CreateIndex
CREATE INDEX "PlatformAuthorization_provider_status_idx" ON "PlatformAuthorization"("provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformAuthorization_businessId_provider_externalUserId_key" ON "PlatformAuthorization"("businessId", "provider", "externalUserId");

-- CreateIndex
CREATE INDEX "PlatformAccount_businessId_idx" ON "PlatformAccount"("businessId");

-- CreateIndex
CREATE INDEX "PlatformAccount_authorizationId_idx" ON "PlatformAccount"("authorizationId");

-- CreateIndex
CREATE INDEX "PlatformAccount_businessId_platform_idx" ON "PlatformAccount"("businessId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformAccount_businessId_platform_externalAccountId_key" ON "PlatformAccount"("businessId", "platform", "externalAccountId");

-- CreateIndex
CREATE INDEX "CustomerInteraction_platformAccountId_idx" ON "CustomerInteraction"("platformAccountId");

-- AddForeignKey
ALTER TABLE "PlatformAuthorization" ADD CONSTRAINT "PlatformAuthorization_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformAccount" ADD CONSTRAINT "PlatformAccount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformAccount" ADD CONSTRAINT "PlatformAccount_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "PlatformAuthorization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInteraction" ADD CONSTRAINT "CustomerInteraction_platformAccountId_fkey" FOREIGN KEY ("platformAccountId") REFERENCES "PlatformAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
