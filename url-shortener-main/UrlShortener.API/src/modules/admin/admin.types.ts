export interface AdminUserResponse {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  urlCount: number;
}

export interface AdminUrlResponse {
  id: string;
  originalUrl: string;
  shortCode: string;
  comment: string | null;
  clicks: number;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  userId: string | null;
  userEmail: string | null;
}

export interface StatsResponse {
  totalUsers: number;
  totalUrls: number;
  totalClicks: number;
  guestUrls: number;
  activeUrls: number;
}
