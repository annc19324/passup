// server/src/app.ts

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import wishlistRoutes from "./routes/wishlist.routes";

import reportRoutes from "./routes/report.routes";
import adminRoutes from "./routes/admin.routes";
import notificationRoutes from "./routes/notification.routes";
import paymentRoutes from "./routes/payment.routes";
import settingRoutes from "./routes/setting.routes";

const app = express();
const PORT = process.env["PORT"] || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "PassUp API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/settings", settingRoutes);

export default app;
