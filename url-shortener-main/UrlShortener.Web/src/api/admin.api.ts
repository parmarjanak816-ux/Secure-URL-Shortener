import api from './axios';
import type { AdminStats, AdminUser, AdminUrl } from '../types/admin.types';

export const getStats = async (): Promise<AdminStats> => {
  const response = await api.get<AdminStats>('/admin/stats');
  return response.data;
};

export const getUsers = async (): Promise<AdminUser[]> => {
  const response = await api.get<AdminUser[]>('/admin/users');
  return response.data;
};

export const updateUserRole = async (id: string, role: 'USER' | 'ADMIN'): Promise<AdminUser> => {
  const response = await api.patch<AdminUser>(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};

export const getUrls = async (): Promise<AdminUrl[]> => {
  const response = await api.get<AdminUrl[]>('/admin/urls');
  return response.data;
};

export const toggleUrl = async (id: string): Promise<AdminUrl> => {
  const response = await api.patch<AdminUrl>(`/admin/urls/${id}/toggle`, {});
  return response.data;
};

export const deleteUrl = async (id: string): Promise<void> => {
  await api.delete(`/admin/urls/${id}`);
};
