import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// Public
router.get("/", getCategories);

// Admin
router.post("/", protect, adminOnly, upload.single('icon'), createCategory);
router.put("/:id", protect, adminOnly, upload.single('icon'), updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
