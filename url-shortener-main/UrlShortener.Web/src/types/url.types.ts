export interface UrlResponse {
    id: string;
    originalUrl: string;
    shortCode: string;
    comment: string | null;
    clicks: number;
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
}

export interface CreateUrlDto {
    originalUrl: string;
    shortCode?: string;
    comment?: string;
}

export interface UpdateCommentDto {
    comment: string;
}