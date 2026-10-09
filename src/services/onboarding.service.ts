 import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../lib/password.js";

interface CreateBusinessAccountInput {
  email: string;
  password: string;
  name?: string;
  businessName: string;
}

export async function createBusinessAccount(
  input: CreateBusinessAccountInput,
) {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;
  const businessName = input.businessName.trim();

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

     const user = await tx.user.create({
  data: {
    email,
    name,
    passwordHash,
  },
  select: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    updatedAt: true,
  },
});

    const business = await tx.business.create({
      data: {
        name: businessName,
      },
    });

    const membership = await tx.membership.create({
      data: {
        userId: user.id,
        businessId: business.id,
        role: "OWNER",
      },
    });

    return {
      user,
      business,
      membership,
    };
  });
}