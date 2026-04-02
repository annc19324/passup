import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import cloudinary from "../utils/cloudinary";

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await UserService.getUserById(userId);

        if (!user) {
            res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { fullName, phone, province, district, ward, addressDetail } = req.body;
        let avatarUrl = req.body.avatar;

        // Nếu có upload file avatar mới
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'passup_avatars',
                resource_type: 'image',
                width: 200,
                height: 200,
                crop: 'fill',
                gravity: 'face'
            });
            avatarUrl = uploadResponse.secure_url;
        }
        
        // Tự động tạo chuỗi address đầy đủ (tùy chọn)
        const fullAddress = province ? `${addressDetail ? addressDetail + ', ' : ''}${ward ? ward + ', ' : ''}${district ? district + ', ' : ''}${province}` : req.body.address;

        const updatedUser = await UserService.updateUser(userId, {
            fullName,
            phone,
            province,
            district,
            ward,
            addressDetail,
            address: fullAddress,
            avatar: avatarUrl
        });

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const data = await UserService.getPublicProfileData(userId);

        if (!data) {
            return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
        }

        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateBackground = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { background } = req.body;
        const updatedUser = await UserService.updateUser(userId, { background });
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
