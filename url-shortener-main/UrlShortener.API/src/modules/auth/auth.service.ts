import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
    createUser,
    findUserByEmail,
    createRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
} from './auth.repository';
import { AuthResponse, LoginDto, RegisterDto } from './auth.types';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;

const hashToken = (token: string): string =>
    crypto.createHash('sha256').update(token).digest('hex');

const issueTokens = async (
    user: { id: string; email: string; role: string },
): Promise<{ accessToken: string; refreshToken: string }> => {
    const secret = process.env.JWT_SECRET!;
    const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await createRefreshToken(user.id, hashToken(refreshToken), expiresAt);

    return { accessToken, refreshToken };
};

export const registerUser = async (dto: RegisterDto): Promise<AuthResponse> => {
    const existingUser = await findUserByEmail(dto.email);
    if (existingUser) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await createUser(dto.email, hashedPassword);

    const { accessToken, refreshToken } = await issueTokens(user);

    return {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.role },
    };
};

export const loginUser = async (dto: LoginDto): Promise<AuthResponse> => {
    const user = await findUserByEmail(dto.email);
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
        throw new Error('Invalid credentials');
    }

    const { accessToken, refreshToken } = await issueTokens(user);

    return {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.role },
    };
};

export const refreshTokens = async (
    rawToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
    const stored = await findRefreshToken(hashToken(rawToken));
    if (!stored) {
        throw new Error('Invalid refresh token');
    }
    if (stored.expiresAt < new Date()) {
        await deleteRefreshToken(stored.tokenHash);
        throw new Error('Refresh token expired');
    }

    await deleteRefreshToken(stored.tokenHash);
    return issueTokens(stored.user);
};

export const logoutUser = async (rawToken: string): Promise<void> => {
    try {
        await deleteRefreshToken(hashToken(rawToken));
    } catch {
        // token already gone — nothing to do
    }
};
