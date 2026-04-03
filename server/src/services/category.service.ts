import prisma from "../config/db";
import slugify from "slugify";

export const getAllCategories = async (admin: boolean = false) => {
    return await prisma.category.findMany({
        where: admin ? {} : { isActive: true },
        orderBy: { id: 'asc' }
    });
};

export const createCategory = async (name: string, icon?: string) => {
    const slug = slugify(name, { lower: true, locale: 'vi' });
    return await prisma.category.create({
        data: { name, slug, icon } as any
    });
};

export const updateCategory = async (id: number, data: any) => {
    if (data.name) {
        data.slug = slugify(data.name, { lower: true, locale: 'vi' });
    }
    return await prisma.category.update({
        where: { id },
        data
    });
};

export const deleteCategory = async (id: number) => {
    return await prisma.category.delete({
        where: { id }
    });
};
