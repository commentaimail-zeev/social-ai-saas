import { prisma } from "../lib/prisma.js";
import { verifyPassword } from "../lib/password.js";

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true,
      memberships: {
        select: {
          id: true,
          role: true,
          business: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user?.passwordHash) {
    return null;
  }

  const passwordIsValid = await verifyPassword(
    password,
    user.passwordHash
  );

  if (!passwordIsValid) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;

  return safeUser;
}