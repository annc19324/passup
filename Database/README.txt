========================================================
  DATABASE - DỰ ÁN PASSUP
========================================================

Dự án PassUp sử dụng PostgreSQL kết hợp Prisma ORM.
Database schema được quản lý bằng Prisma Migrate.

========================================================
CÁCH 1: TỰ ĐỘNG TẠO DATABASE (KHUYẾN NGHỊ)
========================================================

Bước 1: Tạo database trống trong PostgreSQL

  psql -U postgres
  CREATE DATABASE passup;
  \q

Bước 2: Cấu hình file server/.env

  DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/passup"

Bước 3: Chạy lệnh migrate từ thư mục server/

  cd server
  npm install
  npx prisma migrate dev

  → Prisma sẽ tự động tạo toàn bộ bảng dữ liệu
  → Bao gồm: users, products, categories, conversations,
     messages, orders, ratings, wishlists, reports,
     notifications, system_settings, background_options

Bước 4: (Tùy chọn) Xem database trực quan

  npx prisma studio
  → Mở trình duyệt tại http://localhost:5555

========================================================
CÁCH 2: IMPORT TỪ FILE SQL
========================================================

Nếu có file passup.sql đi kèm:

  psql -U postgres -d passup -f passup.sql

========================================================
CẤU TRÚC DATABASE (10 BẢNG CHÍNH)
========================================================

1.  users              - Tài khoản người dùng
2.  products           - Sản phẩm / Tin đăng
3.  categories         - Danh mục sản phẩm
4.  conversations      - Phiên chat
5.  messages           - Nội dung tin nhắn
6.  orders             - Đơn hàng
7.  ratings            - Đánh giá
8.  wishlists          - Yêu thích
9.  reports            - Báo cáo vi phạm
10. notifications      - Thông báo hệ thống
11. system_settings    - Cài đặt hệ thống
12. background_options - Tùy chọn giao diện

========================================================
ENUM TYPES
========================================================

Role:          USER, ADMIN
ProductStatus: AVAILABLE, RESERVED, SOLD
OrderStatus:   PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED
ReportType:    PRODUCT, USER

========================================================
FILE SCHEMA GỐC
========================================================

Xem chi tiết tại: server/prisma/schema.prisma
Sơ đồ ERD tại:   server/prisma/ERD.svg

========================================================
