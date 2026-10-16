import { prisma } from '../../lib/prisma';
import { Role } from '@prisma/client';

export const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { urls: true } } },
  });
};

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { urls: true } } },
  });
};

export const updateUserRole = async (id: string, role: Role) => {
  return prisma.user.update({
    where: { id },
    data: { role },
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};

export const getAllUrls = async () => {
  return prisma.url.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  });
};

export const deleteUrl = async (id: string) => {
  return prisma.url.delete({ where: { id } });
};

export const getStats = async () => {
  const [totalUsers, totalUrls, clicks, guestUrls, activeUrls] = await Promise.all([
    prisma.user.count(),
    prisma.url.count(),
    prisma.url.aggregate({ _sum: { clicks: true } }),
    prisma.url.count({ where: { userId: null } }),
    prisma.url.count({ where: { isActive: true } }),
  ]);

  return {
    totalUsers,
    totalUrls,
    totalClicks: clicks._sum.clicks ?? 0,
    guestUrls,
    activeUrls,
  };
};
