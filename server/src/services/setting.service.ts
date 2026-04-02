import prisma from '../config/db';

export const getSettings = async () => {
    const settings = await prisma.systemSetting.findMany();
    return settings.reduce((acc: Record<string, string>, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});
};

export const updateSetting = async (key: string, value: string) => {
    const setting = await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
    return setting;
};

export const getBackgroundOptions = async () => {
    const options = await prisma.backgroundOption.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return options;
};

export const createBackgroundOption = async (name: string, value: string, type: string) => {
    const option = await prisma.backgroundOption.create({
        data: { name, value, type }
    });
    return option;
};

export const deleteBackgroundOption = async (id: number) => {
    const option = await prisma.backgroundOption.delete({
        where: { id }
    });
    return option;
};
