export interface AdminStats {
  totalUsers: number;
  totalUrls: number;
  totalClicks: number;
  guestUrls: number;
  activeUrls: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  urlCount: number;
}

export interface AdminUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  userEmail: string | null;
}
