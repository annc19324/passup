import bcrypt from "bcrypt";
import prisma from "../config/db";
import { generateToken } from "../utils/jwt";

export async function registerUser(data: {
    email: string,
    password: string,
    fullName: string,
}) {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new Error("Email da duoc su dung")
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            fullName: data.fullName,
        }
    })

    const token = generateToken(newUser.id);
    return {
        user: {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role,
        },
        token,
    };
}

export async function loginUser(data: {
    email: string,
    password: string,
}) {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user) {
        throw new Error("Email không tồn tại");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
        throw new Error("Mật khẩu không chính xác");
    }

    if (user.status === 'BANNED') {
        throw new Error("Tài khoản của bạn đã bị khóa bởi quản trị viên.");
    }

    const token = generateToken(user.id);
    return {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        },
        token,
    };
}

export async function requestResetOTP(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Email không tồn tại trên hệ thống");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await prisma.user.update({
        where: { id: user.id },
        data: { resetCode: otp, resetCodeExpiresAt: expiresAt }
    });

    return otp;
}

export async function resetPasswordWithOTP(data: { email: string, otp: string, newPass: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error("Yêu cầu không hợp lệ");

    if (user.resetCode !== data.otp || !user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
        throw new Error("Mã xác thực không chính xác hoặc đã hết hạn");
    }

    const hashedPassword = await bcrypt.hash(data.newPass, 10);
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, resetCode: null, resetCodeExpiresAt: null }
    });

    return true;
}

export async function changeUserPassword(userId: number, data: { oldPass: string, newPass: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Người dùng không tồn tại");

    const isMatch = await bcrypt.compare(data.oldPass, user.password);
    if (!isMatch) throw new Error("Mật khẩu hiện tại không chính xác");

    const hashedPassword = await bcrypt.hash(data.newPass, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return true;
}