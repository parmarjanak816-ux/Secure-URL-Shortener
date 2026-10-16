import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { findUserById, updateUserName, updateUserPassword } from './users.repository';
import { ChangePasswordDto, ProfileResponse, UpdateProfileDto } from './users.types';

const SALT_ROUNDS = 10;

const mapToProfile = (user: User): ProfileResponse => ({
  id: user.id,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  createdAt: user.createdAt,
});

export const getProfile = async (userId: string): Promise<ProfileResponse> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return mapToProfile(user);
};

export const updateProfile = async (
  userId: string,
  dto: UpdateProfileDto,
): Promise<ProfileResponse> => {
  // Empty string → null (lets the user clear a name)
  const firstName = dto.firstName?.trim() ? dto.firstName.trim() : null;
  const lastName = dto.lastName?.trim() ? dto.lastName.trim() : null;
  const user = await updateUserName(userId, firstName, lastName);
  return mapToProfile(user);
};

export const changePassword = async (
  userId: string,
  dto: ChangePasswordDto,
): Promise<void> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const matches = await bcrypt.compare(dto.currentPassword, user.password);
  if (!matches) {
    throw new Error('Current password is incorrect');
  }
  const hashed = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
  await updateUserPassword(userId, hashed);
};
