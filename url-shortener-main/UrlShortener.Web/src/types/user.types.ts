export interface UserProfile {
    id: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: string;
}

export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
