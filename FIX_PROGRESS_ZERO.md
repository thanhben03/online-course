# Sửa lỗi hiển thị 0/1 bài đã hoàn thành (0%)

## Nguyên nhân có thể:

1. **Bảng chưa tồn tại** - `progress` và `enrollments` chưa được tạo
2. **User chưa đăng ký khóa học** - Không có record trong `enrollments`
3. **Chưa có progress data** - Không có record trong `progress`
4. **API response structure sai** - Data không đúng format mong đợi

## Các bước kiểm tra và sửa:

### Bước 1: Kiểm tra bảng có tồn tại
```bash
# Tạo bảng nếu chưa có
curl -X POST http://localhost:3000/api/init-db
```

### Bước 2: Kiểm tra dữ liệu hiện tại
```bash
# Thay userId=1, courseId=1 với giá trị thực tế
curl "http://localhost:3000/api/test-progress?userId=1&courseId=1"
```

### Bước 3: Tạo dữ liệu test
```bash
# Tạo enrollment và progress mẫu
curl -X POST "http://localhost:3000/api/test-progress" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "courseId": 1,
    "lessonId": 1
  }'
```

### Bước 4: Kiểm tra console logs
Mở DevTools (F12) → Console khi vào trang `/learn/1` để xem:
```
Initial progress check: { ... }
Final progressData: { ... }
lessonProgress map: { ... }
```

### Bước 5: Đăng ký khóa học (nếu chưa)
```bash
curl -X POST "http://localhost:3000/api/progress/course/1" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### Bước 6: Đánh dấu bài học hoàn thành
```bash
curl -X POST "http://localhost:3000/api/progress/1" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "completed": true,
    "watchedDuration": 300
  }'
```

## Đã sửa trong code:

### 1. Auto-enrollment
- Tự động đăng ký user vào khóa học khi vào trang `/learn/[id]`
- Kiểm tra enrollment trước khi fetch progress

### 2. Debug logging
- Thêm `console.log` để theo dõi data flow
- Log API responses và data structure

### 3. Handle nested data
- Xử lý cả `result.data.data` và `result.data`
- Safe access với fallback values

### 4. Test API
- `/api/test-progress` để tạo dữ liệu mẫu
- Kiểm tra và debug dễ dàng

## Kiểm tra nhanh:

1. **Vào trang `/learn/1`**
2. **Mở DevTools Console**
3. **Xem logs**:
   - Có `Initial progress check` không?
   - Có `Auto-enroll` message không?
   - `Final progressData` có đúng structure không?

4. **Click nút đánh dấu hoàn thành** ở sidebar lesson list
5. **Xem progress bar có cập nhật không**

## Troubleshooting:

### Nếu vẫn hiển thị 0%:
1. Kiểm tra `userInfo.id` có đúng không
2. Kiểm tra `courseId` có đúng không  
3. Tạo dữ liệu test bằng API
4. Clear localStorage và login lại

### Nếu console có lỗi:
1. Kiểm tra network tab có API calls thành công không
2. Xem response structure có đúng không
3. Kiểm tra database có data không

### Structure mong đợi:
```json
{
  "success": true,
  "data": {
    "enrollment": { "id": 1, "progress": 50 },
    "progress": {
      "percentage": 50,
      "completedLessons": 1,
      "totalLessons": 2
    },
    "lessonProgress": [
      { "id": 1, "completed": true },
      { "id": 2, "completed": false }
    ]
  }
}
```

