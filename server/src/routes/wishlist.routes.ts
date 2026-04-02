import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { toggleWishlist, getMyWishlist, checkWishlistStatus } from "../controllers/wishlist.controller";

const router = Router();

// Tất cả các thao tác với danh sách yêu thích đều cần đăng nhập `protect`
router.use(protect);

// Lấy danh sách yêu thích của TÔI
router.get("/", getMyWishlist);

// Kiểm tra trạng thái yêu thích của 1 sản phẩm cụ thể
router.get("/check/:id", checkWishlistStatus);

// Thêm hoặc xóa sản phẩm khỏi danh sách yêu thích
router.post("/toggle", toggleWishlist);

export default router;
