import api from './axios';
import type { UrlResponse, CreateUrlDto, UpdateCommentDto } from '../types/url.types';

export const createUrl = async (data: CreateUrlDto): Promise<UrlResponse> => {
    const response = await api.post<UrlResponse>('/urls', data);
    return response.data;
};

export const createGuestUrl = async (originalUrl: string): Promise<UrlResponse> => {
    const response = await api.post<UrlResponse>('/urls', { originalUrl });
    return response.data;
};

export const getAllUrls = async (): Promise<UrlResponse[]> => {
    const response = await api.get<UrlResponse[]>('/urls');
    return response.data;
};

export const updateComment = async (id: string, data: UpdateCommentDto): Promise<UrlResponse> => {
    const response = await api.patch<UrlResponse>(`/urls/${id}/comment`, data);
    return response.data;
};

export const toggleUrlStatus = async (id: string, isActive: boolean): Promise<UrlResponse> => {
    const response = await api.patch<UrlResponse>(`/urls/${id}/toggle`, { isActive });
    return response.data;
};
