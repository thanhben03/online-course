# Debug Lỗi Progress "Cannot read properties of undefined (reading 'percentage')"

## Nguyên nhân có thể:

1. **Bảng chưa được tạo**: `progress` và `enrollments` chưa tồn tại
2. **Không có dữ liệu**: User chưa đăng ký khóa học
3. **Cấu trúc API response sai**: Dữ liệu trả về không đúng format

## Cách kiểm tra:

### 1. Kiểm tra bảng có tồn tại chưa:
```bash
# Gọi API debug
curl "http://localhost:3000/api/debug/progress"
```

### 2. Tạo bảng nếu chưa có:
```bash
# Gọi API init database
curl -X POST "http://localhost:3000/api/init-db"
```

### 3. Kiểm tra dữ liệu cụ thể:
```bash
# Thay userId=1 và courseId=1 với giá trị thực tế
curl "http://localhost:3000/api/debug/progress?userId=1&courseId=1"
```

### 4. Đăng ký khóa học cho user:
```bash
curl -X POST "http://localhost:3000/api/progress/course/1" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### 5. Kiểm tra console log:
Mở Developer Tools (F12) → Console để xem log từ component:
```
Progress data structure: { ... }
```

## Đã sửa trong code:

1. **Safe guards**: Thêm kiểm tra `progressData` trước khi truy cập
2. **Default values**: Đặt giá trị mặc định khi không có data
3. **Error handling**: Xử lý lỗi và đặt default data
4. **Debug logging**: Thêm console.log để kiểm tra data structure

## Test steps:

1. Mở trang course detail: `/course/1`
2. Đăng ký khóa học
3. Vào trang học: `/learn/1`
4. Kiểm tra component CourseProgress có hiển thị không

## Nếu vẫn lỗi:

Kiểm tra trong DevTools Console để xem:
- API có trả về data không
- Data structure như thế nào
- Error cụ thể ở đâu

