# Hệ Thống Quản Lý Thông Tin Nhân Viên (HR Management System)

Dự án này là một ứng dụng quản lý nhân sự toàn diện được xây dựng trên nền tảng Full-stack Next.js.

## Công nghệ sử dụng
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons, Shadcn UI
- **Backend**: Next.js API Routes (RESTful API)
- **Database**: MongoDB (Mongoose)
- **Authentication**: NextAuth.js (JWT)
- **TypeScript**: Sử dụng cho toàn bộ dự án để đảm bảo tính chặt chẽ.

## Yêu cầu môi trường
- Node.js >= 18.x
- MongoDB (cài đặt cục bộ hoặc sử dụng MongoDB Atlas)

## Hướng dẫn cài đặt & Khởi chạy dự án

### 1. Cài đặt các thư viện phụ thuộc
Chạy lệnh sau tại thư mục gốc của dự án để cài đặt tất cả các package:
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo tệp `.env.local` ở thư mục gốc của dự án và thêm các cấu hình sau:
```env
# URL kết nối MongoDB (thay đổi nếu sử dụng DB khác)
MONGODB_URI=mongodb://localhost:27017/qlttnv

# Chuỗi bí mật dùng để mã hóa session cho NextAuth (có thể tạo chuỗi ngẫu nhiên)
NEXTAUTH_SECRET=my_super_secret_key_for_jwt_auth_123!
NEXTAUTH_URL=http://localhost:3000
```

### 3. Chạy Server ở chế độ Phát triển (Development)
Chạy lệnh sau để khởi động dự án:
```bash
npm run dev
```

Truy cập địa chỉ `http://localhost:3000` trên trình duyệt. Mặc định ứng dụng sẽ điều hướng bạn đến giao diện quản lý (nếu chưa đăng nhập sẽ cần đăng nhập).

### 4. Build phiên bản Production (Tùy chọn)
Để tối ưu hóa mã nguồn và chạy ứng dụng trên môi trường thực tế:
```bash
npm run build
npm run start
```

## Các tính năng chính (Core Features)
- **Quản lý Hồ sơ Nhân viên (CRUD)**: Tạo mới, xem danh sách, cập nhật thông tin chi tiết.
- **Thống kê & Báo cáo**: Dashboard hiển thị nhanh số lượng và tình trạng nhân sự.
- **Bảo mật**: Xác thực người dùng thông qua NextAuth.js.
- **Tìm kiếm & Lọc**: Giao diện tìm kiếm trực quan cho danh sách nhân viên.
