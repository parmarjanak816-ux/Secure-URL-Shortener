export interface UpdateProfileDto {
    firstName?: string | null;
    lastName?: string | null;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface ProfileResponse {
    id: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
}
