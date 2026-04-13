# PassUp - Trao Đổi, Mua Bán Sản Phẩm Dành Cho Sinh Viên

## 1. Giới thiệu dự án

**PassUp** là hệ thống sàn thương mại điện tử mô hình C2C (Customer-to-Customer) được phát triển dành riêng cho cộng đồng sinh viên. Hệ thống cho phép sinh viên đăng bán, tìm kiếm và mua lại đồ dùng cũ (sách vở, thiết bị điện tử, đồ gia dụng...) một cách tiện lợi thông qua giao diện web hiện đại.

Điểm nổi bật của PassUp:
- **Chat thời gian thực** (Socket.io) giúp người mua và người bán thương lượng trực tiếp
- **Thanh toán trực tuyến** (PayOS) hỗ trợ nạp lượt đẩy tin bài qua mã QR
- **Lưu trữ ảnh đám mây** (Cloudinary) tối ưu hóa hiệu năng tải ảnh

---

## 2. Công nghệ sử dụng

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 19.2.0 | Xây dựng giao diện Single Page Application |
| Vite | 7.3.1 | Build tool, Hot Module Replacement nhanh |
| TypeScript | 5.9.3 | Kiểm tra kiểu dữ liệu tại thời điểm biên dịch |
| Tailwind CSS | 3.3.3 | Framework CSS utility-first, thiết kế responsive |
| React Router DOM | 7.13.0 | Điều hướng SPA |
| Axios | 1.13.5 | Gọi REST API từ Frontend tới Backend |
| Socket.io Client | 4.8.3 | Kết nối WebSocket phía Client |
| React Hook Form + Zod | 7.71.1 / 4.3.6 | Quản lý và validate form |
| Lucide React | 0.564.0 | Bộ icon SVG hiện đại |
| React Hot Toast | 2.6.0 | Thông báo toast notification |
| Moment.js | 2.30.1 | Xử lý và hiển thị thời gian |
| PayOS Checkout | 1.0.9 | Tích hợp thanh toán QR phía Client |

### Backend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Node.js | >= 18 | Runtime JavaScript phía server |
| Express | 5.2.1 | Web framework xử lý API |
| TypeScript | 5.9.3 | Kiểm tra kiểu dữ liệu |
| Prisma ORM | 5.18.0 | ORM type-safe cho PostgreSQL |
| Socket.io | 4.8.3 | WebSocket server cho Chat real-time |
| Cloudinary | 2.9.0 | SDK upload ảnh lên CDN |
| @payos/node | 2.0.5 | SDK thanh toán PayOS (Webhook) |
| Bcrypt | 5.1.1 | Hash mật khẩu |
| JSON Web Token | 9.0.3 | Xác thực người dùng |
| Multer | 2.1.1 | Xử lý file upload (multipart/form-data) |
| Helmet | 8.1.0 | Bảo mật HTTP headers |
| Morgan | 1.10.1 | Logging HTTP requests |
| Nodemailer | 8.0.4 | Gửi email (quên mật khẩu) |
| Slugify | 1.6.8 | Tạo URL-friendly slug cho sản phẩm |

### Database
| Công nghệ | Mục đích |
|---|---|
| PostgreSQL 14+ | Hệ quản trị cơ sở dữ liệu quan hệ |
| Prisma Migrate | Quản lý phiên bản schema database |

### Tổng kết kiến trúc
```
[React/Vite] ←→ [Express/Node.js] ←→ [PostgreSQL]
      ↕                ↕         ↕
 [Socket.io]     [Cloudinary]  [PayOS]
```

---

## 3. Cấu trúc thư mục

```
PassUp/
├── client/                              # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/                       # 16 trang giao diện
│   │   │   ├── Home.tsx                 # Trang chủ, danh sách sản phẩm
│   │   │   ├── Login.tsx                # Đăng nhập
│   │   │   ├── Register.tsx             # Đăng ký
│   │   │   ├── Sell.tsx                 # Đăng tin bán hàng
│   │   │   ├── ProductDetail.tsx        # Chi tiết sản phẩm
│   │   │   ├── Chat.tsx                 # Nhắn tin thời gian thực
│   │   │   ├── Orders.tsx               # Quản lý đơn hàng
│   │   │   ├── Pricing.tsx              # Gói đẩy tin / Thanh toán
│   │   │   ├── Profile.tsx              # Trang cá nhân
│   │   │   ├── MyProducts.tsx           # Quản lý tin đăng cá nhân
│   │   │   ├── Wishlist.tsx             # Danh sách yêu thích
│   │   │   ├── Admin.tsx                # Dashboard quản trị
│   │   │   ├── EditProduct.tsx          # Chỉnh sửa sản phẩm
│   │   │   ├── SellerProfile.tsx        # Trang người bán
│   │   │   ├── ChangePassword.tsx       # Đổi mật khẩu
│   │   │   └── ForgotPassword.tsx       # Quên mật khẩu
│   │   ├── components/                  # 5 component tái sử dụng
│   │   │   ├── ProductCard.tsx          # Card hiển thị sản phẩm
│   │   │   ├── CategoryScroll.tsx       # Thanh cuộn danh mục ngang
│   │   │   ├── NotificationBell.tsx     # Chuông thông báo real-time
│   │   │   ├── BottomNav.tsx            # Thanh điều hướng mobile
│   │   │   └── BackgroundSelector.tsx   # Chọn background profile
│   │   ├── context/                     # React Context quản lý state
│   │   │   ├── AuthContext.tsx          # Quản lý trạng thái đăng nhập (JWT)
│   │   │   └── BackgroundContext.tsx    # Quản lý theme/background
│   │   ├── services/                    # API service layer (Axios)
│   │   │   ├── api.ts                   # Axios instance + interceptors
│   │   │   └── socket.ts               # Socket.io client connection
│   │   ├── types/                       # TypeScript type definitions
│   │   ├── layouts/                     # Layout wrapper components
│   │   ├── App.tsx                      # Root component + Router config
│   │   └── main.tsx                     # Entry point (ReactDOM)
│   ├── package.json
│   └── vite.config.ts
│
├── server/                              # Backend (Express + Node.js)
│   ├── src/
│   │   ├── controllers/                 # 13 controller xử lý logic
│   │   │   ├── auth.controller.ts       # Đăng nhập, đăng ký, quên MK
│   │   │   ├── product.controller.ts    # CRUD sản phẩm + Cloudinary
│   │   │   ├── chat.controller.ts       # Gửi/nhận tin nhắn + Socket
│   │   │   ├── order.controller.ts      # Đặt hàng, cập nhật trạng thái
│   │   │   ├── payment.controller.ts    # PayOS checkout + Webhook
│   │   │   ├── admin.controller.ts      # Quản trị hệ thống
│   │   │   ├── user.controller.ts       # Quản lý profile
│   │   │   ├── category.controller.ts   # Quản lý danh mục
│   │   │   ├── wishlist.controller.ts   # Yêu thích
│   │   │   ├── rating.controller.ts     # Đánh giá sau giao dịch
│   │   │   ├── report.controller.ts     # Báo cáo vi phạm
│   │   │   ├── notification.controller.ts # Thông báo
│   │   │   └── setting.controller.ts    # Cài đặt hệ thống
│   │   ├── services/                    # 8 service tách biệt logic nghiệp vụ
│   │   │   ├── auth.service.ts          # Xử lý đăng ký, hash password, JWT
│   │   │   ├── product.service.ts       # CRUD sản phẩm, upload Cloudinary
│   │   │   ├── chat.service.ts          # Tạo/lấy conversation, lưu message
│   │   │   ├── user.service.ts          # Cập nhật profile, avatar
│   │   │   ├── category.service.ts      # CRUD danh mục
│   │   │   ├── wishlist.service.ts      # Thêm/xóa yêu thích
│   │   │   ├── notification.service.ts  # Tạo/đọc thông báo
│   │   │   └── setting.service.ts       # Đọc/ghi system settings
│   │   ├── routes/                      # 13 file định tuyến API
│   │   │   ├── auth.routes.ts           # /api/auth/*
│   │   │   ├── product.routes.ts        # /api/products/*
│   │   │   ├── chat.routes.ts           # /api/chat/*
│   │   │   ├── order.routes.ts          # /api/orders/*
│   │   │   ├── payment.routes.ts        # /api/payment/*
│   │   │   ├── admin.routes.ts          # /api/admin/*
│   │   │   ├── user.routes.ts           # /api/users/*
│   │   │   ├── category.routes.ts       # /api/categories/*
│   │   │   ├── wishlist.routes.ts       # /api/wishlist/*
│   │   │   ├── rating.routes.ts         # /api/ratings/*
│   │   │   ├── report.routes.ts         # /api/reports/*
│   │   │   ├── notification.routes.ts   # /api/notifications/*
│   │   │   └── setting.routes.ts        # /api/settings/*
│   │   ├── middleware/                  # Middleware xác thực & upload
│   │   │   ├── auth.middleware.ts       # Verify JWT, kiểm tra role (RBAC)
│   │   │   └── upload.middleware.ts     # Multer config cho file upload
│   │   ├── utils/                       # Hàm tiện ích dùng chung
│   │   │   ├── cloudinary.ts            # Cloudinary SDK config + upload
│   │   │   ├── jwt.ts                   # generateToken / verifyToken
│   │   │   ├── mailer.ts               # Nodemailer transporter + sendMail
│   │   │   └── slugify.ts              # Tạo slug URL-friendly cho sản phẩm
│   │   ├── config/                      # Cấu hình kết nối
│   │   │   ├── db.ts                    # Prisma Client singleton
│   │   │   ├── socket.ts               # Socket.io init + room management
│   │   │   └── payos.ts                # PayOS SDK init
│   │   ├── scripts/                     # Scripts hỗ trợ
│   │   │   └── seed.ts                  # Tạo tài khoản mặc định
│   │   ├── app.ts                       # Express app + middleware + routes
│   │   └── server.ts                    # HTTP server + Socket.io bootstrap
│   ├── prisma/
│   │   ├── schema.prisma                # Database schema (10 models)
│   │   ├── migrations/                  # Migration history
│   │   └── ERD.svg                      # Sơ đồ ERD tự động
│   └── package.json
│
├── Database/
│   ├── passup.sql                       # SQL schema export (import được)
│   └── README.txt                       # Hướng dẫn tạo DB
│
└── .gitignore
```

---

## 4. Chức năng chính

### 4.1. Xác thực & Phân quyền (Auth)
- Đăng ký tài khoản (email, mật khẩu hash bcrypt)
- Đăng nhập (JWT Token)
- Quên mật khẩu (gửi mã xác nhận qua Email - Nodemailer)
- Đổi mật khẩu
- Phân quyền: USER / ADMIN (Middleware RBAC)

### 4.2. Quản lý sản phẩm (Product)
- Đăng tin bán sản phẩm (upload đa ảnh qua Cloudinary)
- Tìm kiếm theo từ khóa, danh mục, khu vực
- Xem chi tiết sản phẩm
- Chỉnh sửa / Xóa tin đăng cá nhân
- Lọc sản phẩm theo trạng thái (AVAILABLE, RESERVED, SOLD)
- Quản lý tồn kho (stock)

### 4.3. Chat thương lượng (Real-time)
- Nhắn tin 1-1 giữa người mua và người bán
- Gửi kèm hình ảnh trong tin nhắn
- Trạng thái đã đọc (isRead)
- Thông báo tin nhắn mới tức thì qua Socket.io

### 4.4. Đặt hàng (Order)
- Tạo đơn hàng (PENDING → CONFIRMED → SHIPPING → COMPLETED)
- Hủy đơn hàng (CANCELLED)
- Lịch sử đơn hàng
- Thông tin giao hàng (địa chỉ, SĐT)

### 4.5. Thanh toán đẩy tin (Payment - PayOS)
- Chọn gói nạp lượt đẩy tin
- Tạo link thanh toán QR (PayOS API)
- Xử lý Webhook tự động (HMAC-SHA256 verify)
- Cập nhật pushCount cho người dùng
- Quản lý gói subscription

### 4.6. Đánh giá (Rating)
- Đánh giá người bán sau hoàn tất đơn hàng (1-5 sao)
- Bình luận kèm đánh giá

### 4.7. Yêu thích (Wishlist)
- Thêm / Xóa sản phẩm khỏi danh sách yêu thích
- Xem danh sách đã lưu

### 4.8. Báo cáo vi phạm (Report)
- Báo cáo sản phẩm / người dùng vi phạm
- Admin xử lý báo cáo

### 4.9. Thông báo (Notification)
- Thông báo đơn hàng mới
- Thông báo tin nhắn
- Thông báo thanh toán thành công
- Đánh dấu đã đọc

### 4.10. Quản trị hệ thống (Admin Dashboard)
- Thống kê tổng quan (Users, Products, Orders, Doanh thu)
- Quản lý người dùng (khóa / mở tài khoản)
- Quản lý danh mục sản phẩm
- Quản lý bài đăng vi phạm
- Cấu hình thông số hệ thống (System Settings)
- Quản lý background options

---

## 5. Hướng dẫn chạy dự án

### 5.1. Yêu cầu môi trường
- **Node.js**: >= 18.0
- **npm**: >= 9.0
- **PostgreSQL**: >= 14.0
- **Git**: để clone source code

### 5.2. Cài đặt Database
```bash
# Tạo database mới trong PostgreSQL
psql -U postgres
CREATE DATABASE passup;
\q
```

### 5.3. Cấu hình biến môi trường
Tạo file `server/.env` với nội dung:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/passup"
JWT_SECRET="your_jwt_secret_key"
PORT=3000

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# PayOS (https://payos.vn)
PAYOS_CLIENT_ID="your_client_id"
PAYOS_API_KEY="your_api_key"
PAYOS_CHECKSUM_KEY="your_checksum_key"

# Nodemailer (Gửi email quên mật khẩu)
MAIL_USER="your_email@gmail.com"
MAIL_PASS="your_app_password"
```

### 5.4. Cài đặt và chạy Backend
```bash
cd server

# Cài đặt dependencies
npm install

# Tạo database schema + migrate
npx prisma migrate dev

# Tạo tài khoản mặc định (admin + user)
npx ts-node src/scripts/seed.ts

# Chạy server (development mode)
npm run dev
```
Server sẽ chạy tại: **http://localhost:3000**

### 5.5. Cài đặt và chạy Frontend
```bash
cd client

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```
Client sẽ chạy tại: **http://localhost:5173**

### 5.6. Kiểm tra hệ thống
- Truy cập **http://localhost:5173** → Giao diện trang chủ
- Truy cập **http://localhost:3000** → API response: `{ message: "PassUp API is running!" }`
- Truy cập **http://localhost:5555** (nếu chạy `npx prisma studio`) → Quản lý DB trực quan

---

## 6. Tài khoản mặc định

Hệ thống có sẵn 2 tài khoản mặc định (được tạo bằng lệnh `npx ts-node src/scripts/seed.ts`):

| Vai trò | Email | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Admin** | `admin` | `12345` | Toàn quyền quản trị: thống kê, quản lý user, sản phẩm, danh mục, cài đặt |
| **User** | `user` | `12345` | Người dùng thường: đăng tin, mua hàng, chat, thanh toán |

> **Lưu ý:** Nếu tài khoản chưa tồn tại, chạy lệnh seed để tạo:
> ```bash
> cd server
> npx ts-node src/scripts/seed.ts
> ```

---

## 7. Ghi chú quan trọng

### API Keys cần thiết
| Service | Đăng ký tại | Mục đích |
|---|---|---|
| Cloudinary | https://cloudinary.com | Upload ảnh sản phẩm |
| PayOS | https://payos.vn | Thanh toán đẩy tin bài |
| Gmail App Password | Google Account Settings | Gửi email quên mật khẩu |

### Lưu ý khi deploy
- File `.env` **KHÔNG** được push lên Git (đã có trong .gitignore)
- Khi deploy production, sử dụng `npm run build` + `npm start`
- Cấu hình CORS trong `socket.ts` cần thay `*` thành domain thực tế
- Database cần backup định kỳ

### API Endpoints chính
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /api/auth/login | Đăng nhập |
| POST | /api/auth/register | Đăng ký |
| GET | /api/products | Danh sách sản phẩm |
| POST | /api/products | Đăng sản phẩm mới |
| GET | /api/chat/conversations | Danh sách hội thoại |
| POST | /api/chat/send | Gửi tin nhắn |
| POST | /api/orders | Tạo đơn hàng |
| POST | /api/payment/create | Tạo link thanh toán |
| POST | /api/payment/webhook | PayOS Webhook callback |
| GET | /api/admin/stats | Thống kê Admin |
