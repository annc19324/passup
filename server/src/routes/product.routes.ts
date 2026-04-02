import { Router } from "express";
import { protect, optionalProtect } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { createProduct, getProducts, getProduct, getMyProducts, deleteProduct, updateProduct } from "../controllers/product.controller";

const router = Router();

// Lấy danh sách sản phẩm Ai cũng xem được
router.get("/", optionalProtect, getProducts);

// Lấy sản phẩm của TÔI (Phải đưa lên trước :id để tránh bị hiểu lầm 'me' là ID)
router.get("/me", protect, getMyProducts);

// Lấy chi tiết 1 sản phẩm
router.get("/:id", optionalProtect, getProduct);

// Cập nhật sản phẩm (Chỉ người bán mới sửa được)
router.put("/:id", protect, updateProduct);

// Xóa sản phẩm (Chỉ người bán mới xóa được)
router.delete("/:id", protect, deleteProduct);

// Đăng sản phẩm mới (1. Phải đăng nhập `protect`, 2. Xử lý up tối đa 5 ảnh `upload.array`)
router.post("/", protect, upload.array("images", 5), createProduct);

export default router;
