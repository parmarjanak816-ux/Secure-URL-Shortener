import { CreateUrlDto, UpdateUrlDto, UrlResponse } from './urls.types';
import {
  createUrl,
  findUrlById,
  findUrlByShortCode,
  findUrlsByUserId,
  incrementClicks,
  toggleUrlActive,
  updateUrlComment,
} from './urls.repository';
import { Url } from '@prisma/client';

const generateShortCode = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

const mapToUrlResponse = (url: Url): UrlResponse => {
  return {
    id: url.id,
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    comment: url.comment,
    clicks: url.clicks,
    isActive: url.isActive,
    expiresAt: url.expiresAt,
    createdAt: url.createdAt,
  };
};

export const createShortUrl = async (dto: CreateUrlDto, userId?: string): Promise<UrlResponse> => {
  if (!userId && dto.shortCode) {
    throw new Error('Custom short codes require an account');
  }

  let shortCode = dto.shortCode || generateShortCode();

  if (dto.shortCode) {
    const existing = await findUrlByShortCode(dto.shortCode);
    if (existing) {
      throw new Error('Short code already in use');
    }
  } else {
    while (await findUrlByShortCode(shortCode)) {
      shortCode = generateShortCode();
    }
  }

  const expiresAt = new Date();
  userId
    ? expiresAt.setDate(expiresAt.getDate() + 90)
    : expiresAt.setMonth(expiresAt.getMonth() + 1);

  const url = await createUrl({
    originalUrl: dto.originalUrl,
    shortCode,
    comment: dto.comment,
    expiresAt,
    userId,
  });

  return mapToUrlResponse(url);
};

export const getUserUrls = async (userId: string): Promise<UrlResponse[]> => {
  const urls = await findUrlsByUserId(userId);
  return urls.map(mapToUrlResponse);
};

export const updateComment = async (
  id: string,
  dto: UpdateUrlDto,
  userId: string,
): Promise<UrlResponse> => {
  const url = await findUrlById(id);

  if (!url) {
    throw new Error('URL not found');
  }

  if (url.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const updated = await updateUrlComment(id, dto.comment ?? '');
  return mapToUrlResponse(updated);
};

export const toggleUrl = async (
  id: string,
  userId: string,
): Promise<UrlResponse> => {
  const url = await findUrlById(id);

  if (!url) {
    throw new Error('Url not found');
  }

  if (url.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const updated = await toggleUrlActive(id, !url.isActive);
  return mapToUrlResponse(updated);
};

export const redirectUrl = async (shortCode: string): Promise<string> => {
  const url = await findUrlByShortCode(shortCode);

  if (!url) {
    throw new Error('URL not found');
  }

  if (!url.isActive) {
    throw new Error('URL is not active');
  }

  if (url.expiresAt && url.expiresAt < new Date()) {
    throw new Error('URL has expired');
  }

  await incrementClicks(url.id);

  return url.originalUrl;
};
