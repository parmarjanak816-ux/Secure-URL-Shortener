import { Role } from '@prisma/client';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllUrls,
  deleteUrl,
  getStats,
} from './admin.repository';
import { toggleUrlActive } from '../urls/urls.repository';
import { AdminUserResponse, AdminUrlResponse, StatsResponse } from './admin.types';

export const getAdminStats = async (): Promise<StatsResponse> => {
  return await getStats();
};

export const getAdminUsers = async (): Promise<AdminUserResponse[]> => {
  const users = await getAllUsers();
  return users.map(user => ({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    urlCount: user._count.urls,
  }));
};

export const updateRole = async (id: string, role: Role): Promise<AdminUserResponse> => {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found');
  const updated = await updateUserRole(id, role);
  return {
    id: updated.id,
    email: updated.email,
    role: updated.role,
    createdAt: updated.createdAt,
    urlCount: user._count.urls,
  };
};

export const removeUser = async (id: string): Promise<void> => {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found');
  await deleteUser(id);
};

export const getAdminUrls = async (): Promise<AdminUrlResponse[]> => {
  const urls = await getAllUrls();
  return urls.map(url => ({
    id: url.id,
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    comment: url.comment,
    clicks: url.clicks,
    isActive: url.isActive,
    expiresAt: url.expiresAt,
    createdAt: url.createdAt,
    userId: url.userId ?? null,
    userEmail: url.user?.email ?? null,
  }));
};

export const toggleAdminUrl = async (id: string): Promise<AdminUrlResponse> => {
  const urls = await getAllUrls();
  const url = urls.find(u => u.id === id);
  if (!url) throw new Error('URL not found');
  const updated = await toggleUrlActive(id, !url.isActive);
  return {
    id: updated.id,
    originalUrl: updated.originalUrl,
    shortCode: updated.shortCode,
    comment: updated.comment,
    clicks: updated.clicks,
    isActive: updated.isActive,
    expiresAt: updated.expiresAt,
    createdAt: updated.createdAt,
    userId: updated.userId ?? null,
    userEmail: url.user?.email ?? null,
  };
};

export const removeUrl = async (id: string): Promise<void> => {
  const urls = await getAllUrls();
  const url = urls.find(u => u.id === id);
  if (!url) throw new Error('URL not found');
  await deleteUrl(id);
};
