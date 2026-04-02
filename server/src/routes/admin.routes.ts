import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.middleware";
import { 
    getStats, getAllUsers, getAllProducts, getAllOrders, updateReportStatus, 
    updateGenericSetting, 
    updateProductByAdmin, updateOrderByAdmin, updateUserByAdmin 
} from "../controllers/admin.controller";

const router = Router();

router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUserByAdmin);
router.get("/products", getAllProducts);
router.put("/products/:id", updateProductByAdmin); // Thêm cập nhật sp cho admin
router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderByAdmin);   // Thêm cập nhật order cho admin
router.put("/reports/:id", updateReportStatus);
router.post("/settings/generic", updateGenericSetting);

export default router;
