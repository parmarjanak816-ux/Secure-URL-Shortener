import { prisma } from '../../lib/prisma';

export const findUrlsByUserId = async (userId: string) => {
  return prisma.url.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const findUrlByShortCode = async (shortCode: string) => {
  return prisma.url.findUnique({
    where: { shortCode },
  });
};

export const findUrlById = async (id: string) => {
  return prisma.url.findUnique({
    where: { id },
  });
};

export const createUrl = async (data: {
  originalUrl: string;
  shortCode: string;
  comment?: string;
  expiresAt: Date;
  userId?: string;
}) => {
  return prisma.url.create({
    data: {
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      comment: data.comment,
      expiresAt: data.expiresAt,
      ...(data.userId && { userId: data.userId }),
    }
  });
};

export const updateUrlComment = async (id: string, comment: string) => {
  return prisma.url.update({
    where: { id },
    data: { comment },
  });
};

export const incrementClicks = async (id: string) => {
  return prisma.url.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  });
};

export const toggleUrlActive = async (id: string, isActive: boolean) => {
  return prisma.url.update({
    where: { id },
    data: { isActive },
  });
};
