export interface CreateUrlDto {
  originalUrl: string;
  shortCode?: string;
  comment?: string;
}

export interface UpdateUrlDto {
  comment: string;
}

export interface UrlResponse {
  id: string;
  originalUrl: string;
  shortCode: string;
  comment: string | null;
  clicks: number;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}
