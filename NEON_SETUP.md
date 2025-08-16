# Hướng dẫn tích hợp Neon Database

## Bước 1: Tạo Neon Database

1. Truy cập [Neon Console](https://console.neon.tech/)
2. Đăng ký/đăng nhập tài khoản
3. Tạo project mới
4. Lưu lại connection string

## Bước 2: Cài đặt dependencies

```bash
npm install @neondatabase/serverless drizzle-orm drizzle-kit bcryptjs
npm install --save-dev @types/bcryptjs
```

## Bước 3: Cấu hình Environment Variables

Tạo file `.env.local` với nội dung:

```env
# Neon Database
DATABASE_URL="postgresql://username:password@hostname:port/database"

# JWT Secret (cho authentication)
JWT_SECRET=your_jwt_secret_key
```

## Bước 4: Khởi tạo Database

Chạy API endpoint để tạo các bảng:

```bash
curl -X POST http://localhost:3000/api/init-db
```

Hoặc truy cập trực tiếp: `http://localhost:3000/api/init-db`

## Bước 5: Test kết nối

Các API endpoints đã được tạo:

- `POST /api/auth/register` - Đăng ký user
- `POST /api/auth/login` - Đăng nhập
- `GET /api/courses` - Lấy danh sách khóa học
- `POST /api/courses` - Tạo khóa học mới

## Cấu trúc Database

### Bảng Users
- id (SERIAL PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- name (VARCHAR)
- password_hash (VARCHAR)
- avatar_url (VARCHAR)
- role (VARCHAR, DEFAULT 'student')
- created_at, updated_at (TIMESTAMP)

### Bảng Courses
- id (SERIAL PRIMARY KEY)
- title (VARCHAR)
- description (TEXT)
- thumbnail_url (VARCHAR)
- price (DECIMAL)
- instructor_id (INTEGER, REFERENCES users)
- status (VARCHAR, DEFAULT 'draft')
- created_at, updated_at (TIMESTAMP)

### Bảng Lessons
- id (SERIAL PRIMARY KEY)
- course_id (INTEGER, REFERENCES courses)
- title (VARCHAR)
- description (TEXT)
- video_url (VARCHAR)
- duration (INTEGER)
- order_index (INTEGER)
- created_at, updated_at (TIMESTAMP)

### Bảng Enrollments
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER, REFERENCES users)
- course_id (INTEGER, REFERENCES courses)
- enrolled_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- progress (INTEGER, DEFAULT 0)

### Bảng Progress
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER, REFERENCES users)
- lesson_id (INTEGER, REFERENCES lessons)
- completed (BOOLEAN, DEFAULT FALSE)
- watched_duration (INTEGER, DEFAULT 0)
- last_watched_at (TIMESTAMP)

### Bảng Uploads
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER, REFERENCES users)
- filename (VARCHAR)
- original_name (VARCHAR)
- file_size (INTEGER)
- file_type (VARCHAR)
- s3_key (VARCHAR)
- s3_url (VARCHAR)
- status (VARCHAR, DEFAULT 'uploading')
- created_at (TIMESTAMP)

## Lưu ý

- Đảm bảo DATABASE_URL được cấu hình đúng
- Chạy init-db trước khi sử dụng các API khác
- Backup database thường xuyên
- Sử dụng connection pooling cho production 