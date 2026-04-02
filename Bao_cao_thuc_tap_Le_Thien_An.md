# BÁO CÁO THỰC TẬP HỆ THỐNG THÔNG TIN TÍCH HỢP

**Dự án:** PassUp - Nền tảng mua bán đồ cũ dành cho sinh viên
**Sinh viên thực hiện:** Lê Thiên An
**Mã sinh viên:** 22810310030
**Lớp:** D17CNPM1
**Giảng viên hướng dẫn:** [Tên Giảng Viên]

---

## CHƯƠNG 1: ĐẶT VẤN ĐỀ CẦN GIẢI QUYẾT

### 1.1 Lý do chọn đề tài
Trong môi trường đại học, sinh viên thường có nhu cầu thanh lý các đồ dùng không còn sử dụng như giáo trình, tài liệu, đồ gia dụng nhỏ, thiết bị điện tử cũ. Tuy nhiên, việc tìm kiếm người mua hoặc người bán tin cậy trong cùng khu vực gặp nhiều khó khăn. Các nền tảng hiện nay thường quá rộng lớn, không tối ưu cho nhu cầu giao lưu, trao đổi nội bộ sinh viên.

Dự án **PassUp** ra đời nhằm xây dựng một hệ thống thông tin tích hợp giúp kết nối người mua và người bán một cách nhanh chóng, hiệu quả và an toàn.

### 1.2 Mục tiêu của đề tài
- Xây dựng nền tảng web hiện đại, dễ sử dụng.
- Tích hợp các hệ thống bên thứ ba để tối ưu hóa trải nghiệm người dùng (lưu trữ ảnh, chat thời gian thực).
- Cung cấp bộ lọc theo địa lý (Tỉnh/Thành, Quận/Huyện) để hỗ trợ giao dịch trực tiếp.

### 1.3 Tổng quan về giải pháp
Hệ thống được phát triển theo mô hình Client-Server:
- **Frontend:** React, TypeScript, TailwindCSS.
- **Backend:** Node.js (Express), Prisma ORM.
- **Tích hợp:** Cloudinary (Quản lý hình ảnh), Socket.io (Chat thời gian thực).
- **Cơ sở dữ liệu:** PostgreSQL.

---

## CHƯƠNG 2: CHI TIẾT GIẢI PHÁP KỸ THUẬT CÔNG NGHỆ

### 2.1 Cơ sở lý thuyết liên quan
- **Hệ thống thông tin tích hợp:** Là hệ thống kết hợp nhiều module và dịch vụ khác nhau để giải quyết một bài toán nghiệp vụ phức tạp.
- **RESTful API:** Giao thức kết nối giữa Client và Server.
- **WebSocket:** Giao thức truyền tải dữ liệu hai chiều thời gian thực.

### 2.2 Chi tiết giải pháp kỹ thuật tích hợp

#### 2.2.1 Tích hợp Cloudinary API (Dịch vụ quản lý hình ảnh)
- **Vai trò:** Lưu trữ, tối ưu hóa và cung cấp URL hình ảnh sản phẩm.
- **Cách thức:** Server nhận file từ Client qua Multer, sau đó đẩy lên Cloudinary qua thư viện `cloudinary`. Kết quả trả về là URL bảo mật lưu vào Database.
- **Lợi ích:** Giảm tải cho Server, tự động resize và nén ảnh để tăng tốc độ tải trang.

#### 2.2.2 Tích hợp Socket.io (Hệ thống chat thời gian thực)
- **Vai trò:** Hỗ trợ người mua và người bán nhắn tin trực tiếp.
- **Cách thức:** Thiết lập kết nối song công giữa trình duyệt và server. Khi có tin nhắn mới, server sẽ "emit" sự kiện đến đúng client nhận.
- **Lợi ích:** Tăng tương tác, giúp việc chốt đơn hàng diễn ra nhanh chóng.

#### 2.2.3 Tích hợp Prisma & PostgreSQL
- **Vai trò:** Quản lý dữ liệu quan hệ (User, Product, Order, Chat).
- **Lợi ích:** Đảm bảo toàn vẹn dữ liệu, hỗ trợ query mạnh mẽ và dễ dàng mở rộng.

---

## CHƯƠNG 3: TRIỂN KHAI GIẢI PHÁP

### 3.1 Thiết kế hệ thống

#### 3.1.1 Biểu đồ Use Case
- **Khách vãng lai:** Xem sản phẩm, tìm kiếm, lọc theo danh mục/địa điểm.
- **Người dùng:** Đăng bán sản phẩm, chat, đặt hàng, quản lý đơn hàng, yêu thích sản phẩm.
- **Admin:** Quản lý người dùng, danh mục, duyệt báo cáo vi phạm, quản trị dashboard.

#### 3.1.2 Sơ đồ cơ sở dữ liệu (Prisma Schema)
- **User:** Lưu thông tin cá nhân, số dư, gói thành viên.
- **Product:** Lưu tiêu đề, giá, hình ảnh (từ Cloudinary), địa chỉ, trạng thái.
- **Order:** Quản lý giao dịch giữa người mua và người bán.
- **Message/Conversation:** Lưu nội dung trò chuyện thời gian thực.

### 3.2 Cài đặt và thực nghiệm
- **Môi trường:** Node.js v18+, PostgreSQL 15.
- **Các bước cài đặt:**
  1. Clone source code từ repository.
  2. Cấu hình file `.env` (DATABASE_URL, CLOUDINARY_URL, JWT_SECRET).
  3. Chạy `npm install` và `npx prisma db push`.
  4. Khởi động server (`npm run dev`) và client (`npm run dev`).

### 3.3 Demo kết quả đạt được
- **Giao diện Trang chủ:** Hiển thị sản phẩm theo dạng Grid, có bộ lọc khu vực thông minh.
- **Chức năng Đăng tin:** Tích hợp upload tối đa 5 ảnh, tự động tối ưu hóa qua Cloudinary.
- **Hệ thống Chat:** Tin nhắn hiển thị tức thời, hỗ trợ gửi ảnh trong chat.
- **Quản lý đơn hàng:** Quy trình từ Chờ xác nhận -> Đã giao -> Hoàn tất.

---

## KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 1. Kết quả đạt được
- Hoàn thiện hệ thống mua bán đồ cũ PassUp với đầy đủ chức năng cơ bản.
- Tích hợp thành công các dịch vụ bên thứ ba (Cloudinary, Socket.io).
- Giao diện thân thiện, tương thích với thiết bị di động.

### 2. Hạn chế
- Chưa tích hợp thanh toán trực tuyến (Momo, VNPay).
- Hệ thống định vị địa lý hiện đang dùng dữ liệu tĩnh, chưa dùng Map API để chỉ đường.

### 3. Hướng phát triển trong tương lai
- Tích hợp thanh toán điện tử để đảm bảo an toàn giao dịch.
- Xây dựng ứng dụng di động (React Native) để người dùng nhận thông báo tốt hơn.
- Sử dụng AI để gợi ý sản phẩm dựa trên sở thích người dùng.

---
**Hà Nội, ngày 29 tháng 03 năm 2026**
**Sinh viên thực hiện**
*(Ký và ghi rõ họ tên)*
**Lê Thiên An**
