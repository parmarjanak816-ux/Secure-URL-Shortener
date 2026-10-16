import api from './axios';
import type { LoginDto, RegisterDto, AuthResponse } from '../types/auth.types';

export const login = async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
};

export const register = async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
};

export const logout = async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
};