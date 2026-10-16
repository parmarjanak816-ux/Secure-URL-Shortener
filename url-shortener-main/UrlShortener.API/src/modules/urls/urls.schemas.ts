import { z } from 'zod';

export const createUrlSchema = z.object({
  originalUrl: z.string().url('Must be a valid URL'),
  shortCode: z.string().min(3).max(20).optional(),
  comment: z.string().max(200).optional(),
});

export const updateCommentSchema = z.object({
  comment: z.string().max(200),
});

export const toggleUrlSchema = z.object({
  isActive: z.boolean(),
});
