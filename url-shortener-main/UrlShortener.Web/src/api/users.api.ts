import api from './axios';
import type { UserProfile, UpdateProfileDto, ChangePasswordDto } from '../types/user.types';

export const getProfile = async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/me');
    return response.data;
};

export const updateProfile = async (data: UpdateProfileDto): Promise<UserProfile> => {
    const response = await api.patch<UserProfile>('/users/me', data);
    return response.data;
};

export const changePassword = async (data: ChangePasswordDto): Promise<void> => {
    await api.post('/users/me/password', data);
};
