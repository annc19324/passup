import prisma from "../config/db";

export const getUserById = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            address: true,
            province: true,
            district: true,
            ward: true,
            addressDetail: true,
            avatar: true,
            createdAt: true,
            role: true,
            background: true,
            subscriptionType: true,
            pushCount: true,
            postLimit: true,
            status: true
        }
    });
};

export const updateUser = async (id: number, data: { fullName?: string, phone?: string, address?: string, province?: string, district?: string, ward?: string, addressDetail?: string, avatar?: string, background?: string }) => {
    return await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            address: true,
            province: true,
            district: true,
            ward: true,
            addressDetail: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
            role: true,
            pushCount: true,
            postLimit: true,
            status: true
        }
    });
};
export const getPublicProfileData = async (userId: number) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            avatar: true,
            address: true,
            province: true,
            createdAt: true,
            products: {
                where: { status: 'AVAILABLE' },
                orderBy: { createdAt: 'desc' },
                include: { category: true }
            }
        }
    });
};
