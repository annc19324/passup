import { Request, Response } from "express";
import * as CategoryService from "../services/category.service";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const isAdmin = req.query["admin"] === 'true';
        const categories = await CategoryService.getAllCategories(isAdmin);
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const category = await CategoryService.createCategory(name);
        res.status(201).json({ success: true, data: category });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        const { name, isActive } = req.body;
        const category = await CategoryService.updateCategory(id, { name, isActive });
        res.status(200).json({ success: true, data: category });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        await CategoryService.deleteCategory(id);
        res.status(200).json({ success: true, message: "Xóa danh mục thành công" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
