import { prisma } from '../../lib/prisma';

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {email},
    });
};

export const createUser = async (email: string, hashedPassword: string) => {
    return prisma.user.create({
        data:{
            email,
            password: hashedPassword,
        },
    });
};

export const createRefreshToken = async (userId: string, tokenHash: string, expiresAt: Date) => {
    return prisma.refreshToken.create({
        data: { userId, tokenHash, expiresAt },
    });
};

export const findRefreshToken = async (tokenHash: string) => {
    return prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });
};

export const deleteRefreshToken = async (tokenHash: string) => {
    return prisma.refreshToken.delete({
        where: { tokenHash },
    });
};