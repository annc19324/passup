import { Request, Response } from 'express';
import * as SettingService from '../services/setting.service';
import cloudinary from '../utils/cloudinary';

export const getSystemSettings = async (req: Request, res: Response) => {
    try {
        const settings = await SettingService.getSettings();
        return res.json({ success: true, data: settings });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const updateSetting = async (req: Request, res: Response) => {
    try {
        const { key } = req.body;
        let { value } = req.body;

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'system_settings',
                resource_type: 'image'
            });
            value = uploadResponse.secure_url;
        }

        const setting = await SettingService.updateSetting(key, value);
        return res.json({ success: true, data: setting });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getBackgroundOptions = async (req: Request, res: Response) => {
    try {
        const options = await SettingService.getBackgroundOptions();
        return res.json({ success: true, data: options });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const createBackgroundOption = async (req: Request, res: Response) => {
    try {
        const { name, type } = req.body;
        let { value } = req.body;

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'background_options',
                resource_type: 'image'
            });
            value = uploadResponse.secure_url;
        }

        const option = await SettingService.createBackgroundOption(name, value, type);
        return res.json({ success: true, data: option });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteBackgroundOption = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await SettingService.deleteBackgroundOption(Number(id));
        return res.json({ success: true, message: 'Deleted' });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
