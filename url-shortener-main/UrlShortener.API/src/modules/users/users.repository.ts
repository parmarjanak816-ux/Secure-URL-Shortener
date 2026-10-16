import { prisma } from '../../lib/prisma';

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUserName = async (
  id: string,
  firstName: string | null,
  lastName: string | null,
) => {
  return prisma.user.update({
    where: { id },
    data: { firstName, lastName },
  });
};

export const updateUserPassword = async (id: string, hashedPassword: string) => {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
};
