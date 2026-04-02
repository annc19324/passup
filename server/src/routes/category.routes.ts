import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

// Public
router.get("/", getCategories);

// Admin
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
