import "dotenv/config";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const VERSION = "v1";

function getEncryptionKey() {
  const rawKey =
    process.env.PLATFORM_TOKEN_ENCRYPTION_KEY;

  if (!rawKey) {
    throw new Error(
      "PLATFORM_TOKEN_ENCRYPTION_KEY_MISSING"
    );
  }

  const key = Buffer.from(rawKey, "base64");

  if (key.length !== KEY_LENGTH) {
    throw new Error(
      "PLATFORM_TOKEN_ENCRYPTION_KEY_INVALID"
    );
  }

  return key;
}

export function encryptToken(token: string) {
  if (!token) {
    throw new Error("TOKEN_VALUE_REQUIRED");
  }

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(
    ALGORITHM,
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptToken(encryptedToken: string) {
  try {
    const [
      version,
      ivBase64,
      authTagBase64,
      encryptedBase64,
    ] = encryptedToken.split(":");

    if (
      version !== VERSION ||
      !ivBase64 ||
      !authTagBase64 ||
      !encryptedBase64
    ) {
      throw new Error();
    }

    const key = getEncryptionKey();

    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivBase64, "base64")
    );

    decipher.setAuthTag(
      Buffer.from(authTagBase64, "base64")
    );

    const decrypted = Buffer.concat([
      decipher.update(
        Buffer.from(encryptedBase64, "base64")
      ),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }
  catch {
    throw new Error("TOKEN_DECRYPTION_FAILED");
  }
}