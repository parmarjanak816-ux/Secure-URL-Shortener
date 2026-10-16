interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
};

export const getRole = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return decodeToken(token)?.role ?? null;
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};
