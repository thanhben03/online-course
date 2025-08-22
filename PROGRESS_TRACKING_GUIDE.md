# Hướng dẫn tính năng theo dõi tiến trình học

## Tổng quan

Hệ thống theo dõi tiến trình học cho phép:
- Lưu lại tiến trình học của học viên theo từng bài học
- Tính toán phần trăm hoàn thành khóa học
- Hiển thị tiến trình chi tiết
- Đánh dấu bài học đã hoàn thành

## Cấu trúc Database

### Bảng `progress`
```sql
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lesson_id INTEGER REFERENCES lessons(id),
  completed BOOLEAN DEFAULT FALSE,
  watched_duration INTEGER DEFAULT 0,
  last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);
```

### Bảng `enrollments`
```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  progress INTEGER DEFAULT 0, -- Phần trăm hoàn thành (0-100)
  UNIQUE(user_id, course_id)
);
```

## API Endpoints

### 1. Cập nhật tiến trình bài học
**POST** `/api/progress/[lessonId]`

```json
{
  "userId": 1,
  "watchedDuration": 120,
  "completed": true
}
```

### 2. Lấy tiến trình bài học
**GET** `/api/progress/[lessonId]?userId=1`

### 3. Lấy tiến trình khóa học
**GET** `/api/progress/course/[courseId]?userId=1`

### 4. Đăng ký khóa học
**POST** `/api/progress/course/[courseId]`

```json
{
  "userId": 1
}
```

## Cách sử dụng

### 1. Trong trang học (`/learn/[id]`)
- Tiến trình được tự động tải khi vào khóa học
- Hiển thị phần trăm hoàn thành tổng thể
- Đánh dấu bài học đã hoàn thành bằng icon checkmark
- Nút bấm để đánh dấu bài học hoàn thành

### 2. Trong trang chi tiết khóa học (`/course/[id]`)
- Xem trước thông tin khóa học
- Đăng ký khóa học
- Hiển thị tiến trình học (nếu đã đăng ký)

### 3. Component `CourseProgress`
- Hiển thị tiến trình chi tiết
- Thống kê số bài học đã hoàn thành
- Danh sách chi tiết từng bài học
- Thời gian học tích lũy

## Tính năng chính

### 1. Tính phần trăm hoàn thành
- Dựa trên số bài học đã đánh dấu hoàn thành
- Cập nhật tự động khi học viên hoàn thành bài học
- Công thức: `(số_bài_hoàn_thành / tổng_số_bài) * 100`

### 2. Theo dõi thời gian xem
- Lưu thời gian đã xem của từng bài học
- Hiển thị tổng thời gian đã học
- So sánh với tổng thời lượng khóa học

### 3. Đánh dấu hoàn thành
- Nút bấm để đánh dấu bài học hoàn thành
- Icon thay đổi: Circle → CheckCircle
- Màu sắc thay đổi để phân biệt trạng thái

### 4. Thống kê tiến trình
- Số bài học đã hoàn thành / tổng số bài
- Phần trăm hoàn thành
- Thời gian học tích lũy
- Trạng thái khóa học (Chưa bắt đầu, Đang học, Hoàn thành)

## Giao diện người dùng

### 1. Progress Bar
- Hiển thị phần trăm hoàn thành
- Màu sắc thể hiện tiến độ
- Thông tin chi tiết dưới thanh progress

### 2. Lesson List
- Icon trạng thái cho từng bài học
- Nút đánh dấu hoàn thành
- Thông tin thời gian

### 3. Progress Card
- Tổng quan tiến trình
- Thống kê chi tiết
- Badge trạng thái
- Thông báo hoàn thành

## Luồng hoạt động

1. **Đăng ký khóa học**: Tạo record trong bảng `enrollments`
2. **Bắt đầu học**: Tạo record trong bảng `progress` cho bài học đầu tiên
3. **Đánh dấu hoàn thành**: Cập nhật `completed = true` trong bảng `progress`
4. **Tính toán tiến trình**: Cập nhật phần trăm trong bảng `enrollments`
5. **Hoàn thành khóa học**: Đặt `completed_at` trong bảng `enrollments`

## Tối ưu hóa

- Index trên `(user_id, lesson_id)` cho bảng `progress`
- Index trên `(user_id, course_id)` cho bảng `enrollments`
- Cache kết quả tính toán tiến trình
- Lazy loading cho danh sách bài học lớn

## Lưu ý quan trọng

1. **Unique constraints** đảm bảo mỗi user chỉ có 1 record progress cho mỗi bài học
2. **ON CONFLICT DO UPDATE** để cập nhật progress thay vì tạo mới
3. **Automatic calculation** tiến trình khóa học được tự động tính khi cập nhật progress bài học
4. **Data consistency** đảm bảo tính nhất quán giữa progress và enrollment data

