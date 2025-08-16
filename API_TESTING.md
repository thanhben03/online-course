# Hướng dẫn Test API

## Bước 1: Cài đặt dependencies

```bash
npm install @neondatabase/serverless drizzle-orm drizzle-kit bcryptjs
npm install --save-dev @types/bcryptjs
```

## Bước 2: Cấu hình Environment Variables

Tạo file `.env.local`:

```env
# Neon Database
DATABASE_URL="postgresql://username:password@hostname:port/database"

# JWT Secret (cho authentication)
JWT_SECRET=your_jwt_secret_key
```

## Bước 3: Khởi tạo Database và Tạo Dữ liệu Mẫu

Chạy server development:
```bash
npm run dev
```

### Cách 1: Sử dụng Admin Dashboard
Truy cập `http://localhost:3000/admin` và sử dụng giao diện để:
1. Khởi tạo database
2. Tạo dữ liệu mẫu

### Cách 2: Sử dụng API trực tiếp

Khởi tạo database:
```bash
curl -X POST http://localhost:3000/api/init-db
```

Tạo dữ liệu mẫu:
```bash
curl -X POST http://localhost:3000/api/seed-data
```

## Bước 4: Test các API endpoints

### 1. Đăng ký user mới

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "test@example.com",
    "password": "123456"
  }'
```

### 2. Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

### 3. Tạo khóa học mới

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lập trình Web Frontend",
    "description": "Học HTML, CSS, JavaScript và React từ cơ bản đến nâng cao",
    "thumbnail_url": "/placeholder.svg",
    "price": 500000,
    "instructor_id": 1,
    "status": "published"
  }'
```

### 4. Lấy danh sách khóa học

```bash
curl -X GET http://localhost:3000/api/courses
```

### 5. Lấy thông tin khóa học theo ID

```bash
curl -X GET http://localhost:3000/api/courses/1
```

### 6. Cập nhật khóa học

```bash
curl -X PUT http://localhost:3000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lập trình Web Frontend (Cập nhật)",
    "description": "Mô tả mới",
    "price": 600000,
    "status": "published"
  }'
```

### 7. Xóa khóa học

```bash
curl -X DELETE http://localhost:3000/api/courses/1
```

### 8. Lấy danh sách bài học của khóa học

```bash
curl -X GET http://localhost:3000/api/courses/1/lessons
```

### 9. Tạo bài học mới cho khóa học

```bash
curl -X POST http://localhost:3000/api/courses/1/lessons \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bài học mới",
    "description": "Mô tả bài học",
    "video_url": "https://example.com/video.mp4",
    "duration": 1800,
    "order_index": 5
  }'
```

## Bước 5: Test Frontend

1. Truy cập `http://localhost:3000/admin` để quản lý database
2. Truy cập `http://localhost:3000/register` để đăng ký
3. Truy cập `http://localhost:3000/login` để đăng nhập
4. Truy cập `http://localhost:3000/courses` để xem danh sách khóa học

## Lưu ý

- Đảm bảo Neon database đã được cấu hình đúng
- Kiểm tra console để xem lỗi nếu có
- Sử dụng Network tab trong DevTools để debug API calls
- Backup database trước khi test

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra DATABASE_URL trong .env.local
- Đảm bảo Neon database đang hoạt động
- Kiểm tra firewall/network

### Lỗi API 500
- Kiểm tra console server để xem lỗi chi tiết
- Đảm bảo đã chạy init-db trước
- Kiểm tra dependencies đã cài đặt đầy đủ

### Lỗi CORS
- Đảm bảo đang chạy trên localhost
- Kiểm tra cấu hình Next.js 