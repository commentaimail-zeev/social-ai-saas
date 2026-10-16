-- CreateEnum
CREATE TYPE "PlatformConnectionStatus" AS ENUM ('PENDING', 'CONNECTED', 'REAUTH_REQUIRED', 'DISCONNECTED', 'ERROR');

-- CreateTable
CREATE TABLE "PlatformConnection" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "status" "PlatformConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "externalAccountId" TEXT NOT NULL,
    "externalAccountName" TEXT,
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformConnection_businessId_idx" ON "PlatformConnection"("businessId");

-- CreateIndex
CREATE INDEX "PlatformConnection_platform_status_idx" ON "PlatformConnection"("platform", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConnection_businessId_platform_externalAccountId_key" ON "PlatformConnection"("businessId", "platform", "externalAccountId");

-- AddForeignKey
ALTER TABLE "PlatformConnection" ADD CONSTRAINT "PlatformConnection_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
