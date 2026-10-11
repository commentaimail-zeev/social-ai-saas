-- CreateEnum
CREATE TYPE "ReplyLanguageMode" AS ENUM ('MATCH_CUSTOMER', 'FIXED');

-- CreateEnum
CREATE TYPE "ReplyTone" AS ENUM ('BALANCED', 'FRIENDLY', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "ReplyMode" AS ENUM ('REVIEW_REQUIRED', 'AUTOMATIC');

-- CreateTable
CREATE TABLE "BusinessAiSettings" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "replyLanguageMode" "ReplyLanguageMode" NOT NULL DEFAULT 'MATCH_CUSTOMER',
    "defaultReplyLanguage" TEXT NOT NULL DEFAULT 'he',
    "replyTone" "ReplyTone" NOT NULL DEFAULT 'BALANCED',
    "replyMode" "ReplyMode" NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "customInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessAiSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAiSettings_businessId_key" ON "BusinessAiSettings"("businessId");

-- AddForeignKey
ALTER TABLE "BusinessAiSettings" ADD CONSTRAINT "BusinessAiSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
