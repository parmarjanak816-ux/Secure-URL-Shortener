import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().trim().max(50, 'First name too long').optional(),
  lastName: z.string().trim().max(50, 'Last name too long').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
