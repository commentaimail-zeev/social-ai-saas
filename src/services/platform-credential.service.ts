import { prisma } from "../lib/prisma.js";
import {
  encryptToken,
  decryptToken,
} from "../lib/token-encryption.js";

interface SavePlatformCredentialInput {
  authorizationId: string;
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  tokenType?: string | null;
  scopes?: string[];
}

export async function savePlatformCredential({
  authorizationId,
  accessToken,
  refreshToken,
  accessTokenExpiresAt,
  refreshTokenExpiresAt,
  tokenType,
  scopes = [],
}: SavePlatformCredentialInput) {
  const accessTokenEncrypted =
    encryptToken(accessToken);

  const refreshTokenEncrypted =
    refreshToken
      ? encryptToken(refreshToken)
      : null;

  return prisma.platformCredential.upsert({
    where: {
      authorizationId,
    },
    update: {
      accessTokenEncrypted,
      refreshTokenEncrypted,
      accessTokenExpiresAt:
        accessTokenExpiresAt ?? null,
      refreshTokenExpiresAt:
        refreshTokenExpiresAt ?? null,
      tokenType: tokenType ?? null,
      scopes,
    },
    create: {
      authorizationId,
      accessTokenEncrypted,
      refreshTokenEncrypted,
      accessTokenExpiresAt:
        accessTokenExpiresAt ?? null,
      refreshTokenExpiresAt:
        refreshTokenExpiresAt ?? null,
      tokenType: tokenType ?? null,
      scopes,
    },
    select: {
      id: true,
      authorizationId: true,
      accessTokenExpiresAt: true,
      refreshTokenExpiresAt: true,
      tokenType: true,
      scopes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getDecryptedPlatformCredential(
  authorizationId: string
) {
  const credential =
    await prisma.platformCredential.findUnique({
      where: {
        authorizationId,
      },
    });

  if (!credential) {
    throw new Error("PLATFORM_CREDENTIAL_NOT_FOUND");
  }

  return {
    accessToken: decryptToken(
      credential.accessTokenEncrypted
    ),
    refreshToken:
      credential.refreshTokenEncrypted
        ? decryptToken(
            credential.refreshTokenEncrypted
          )
        : null,
    accessTokenExpiresAt:
      credential.accessTokenExpiresAt,
    refreshTokenExpiresAt:
      credential.refreshTokenExpiresAt,
    tokenType: credential.tokenType,
    scopes: credential.scopes,
  };
}