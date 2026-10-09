import {
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;

function scryptAsync(
  password: string,
  salt: string,
  keyLength: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
) {
  const [algorithm, salt, keyHex] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !keyHex) {
    return false;
  }

  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = await scryptAsync(
    password,
    salt,
    storedKey.length,
  );

  return (
    storedKey.length === derivedKey.length &&
    timingSafeEqual(storedKey, derivedKey)
  );
}