# Hệ thống kiểm tra tiến trình xem video trước khi hoàn thành bài học

## Tổng quan

Hệ thống đã được cập nhật để ngăn chặn học viên đánh dấu hoàn thành bài học mà chưa xem đủ video. Học viên phải xem ít nhất **90%** video trước khi có thể hoàn thành bài học.

## Tính năng chính

### 1. **Theo dõi tiến trình xem video realtime**
- Tự động theo dõi thời gian xem video của học viên
- Cập nhật database mỗi 10 giây
- Hiển thị progress bar realtime trên video player

### 2. **Validation hoàn thành bài học**
- Kiểm tra học viên đã xem ít nhất 90% video
- Hiển thị thông báo lỗi nếu chưa đủ điều kiện
- Chỉ cho phép hoàn thành khi đạt yêu cầu

### 3. **UI/UX cải tiến**
- Progress bar hiển thị trên video player
- Icon completion button thay đổi màu và trạng thái
- Tooltip thông báo điều kiện hoàn thành
- Toast notifications thay vì alert

## Chi tiết tính năng

### **VideoPlayer Component**
```typescript
// Tự động tracking progress
onProgressUpdate={(watchedDuration, totalDuration, percentageWatched) => {
  // Cập nhật state và gửi lên server
}}

// Event listeners
- play: Bắt đầu tracking
- pause: Dừng tracking và cập nhật progress
- ended: Cập nhật final progress
```

### **API Validation**
```typescript
// /api/progress/[lessonId] - POST
{
  "userId": 1,
  "completed": true,
  "watchedDuration": 450  // giây
}

// Response nếu chưa đủ điều kiện
{
  "success": false,
  "error": "Bạn cần xem ít nhất 90% video để hoàn thành bài học",
  "details": {
    "watchedPercentage": 75,
    "requiredPercentage": 90,
    "watchedDuration": 450,
    "totalDuration": 600
  }
}
```

### **Database Schema**
```sql
-- Bảng progress đã có các trường cần thiết
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lesson_id INTEGER REFERENCES lessons(id),
  completed BOOLEAN DEFAULT FALSE,
  watched_duration INTEGER DEFAULT 0,  -- Thời gian đã xem (giây)
  last_watched_at TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Cập nhật progress với điều kiện
UPDATE progress SET 
  watched_duration = GREATEST(watched_duration, new_duration),
  completed = CASE 
    WHEN new_duration >= (lesson_duration * 0.9) THEN true 
    ELSE false 
  END
```

## Luồng hoạt động

### **1. Học viên xem video**
1. VideoPlayer bắt đầu tracking khi play
2. Cập nhật progress mỗi giây (UI) và mỗi 10 giây (DB)
3. Hiển thị % đã xem trên progress bar

### **2. Khi học viên muốn hoàn thành**
1. Click vào icon completion button
2. Hệ thống kiểm tra: `watchedDuration >= lessonDuration * 0.9`
3. Nếu đủ điều kiện: Đánh dấu completed = true
4. Nếu chưa đủ: Hiển thị toast error với thông tin chi tiết

### **3. Visual feedback**
- **Chưa xem đủ**: Circle icon xám, button disabled, tooltip warning
- **Đã xem đủ**: Circle icon xanh nhấp nháy, button enabled
- **Đã hoàn thành**: CheckCircle icon xanh

## Cấu hình

### **Thay đổi % yêu cầu**
```typescript
// Trong /api/progress/[lessonId]/route.ts
const requiredWatchPercentage = 90  // Thay đổi từ 90% thành giá trị khác
```

### **Thay đổi tần suất cập nhật**
```typescript
// Trong VideoPlayer component
// Cập nhật UI mỗi giây
setInterval(() => updateProgress(), 1000)

// Cập nhật DB mỗi 10 giây
if (watchedSeconds % 10 === 0) {
  await updateDatabase()
}
```

## Testing

### **Test cases cần kiểm tra:**

1. **Video tracking**
   - Play video → progress tăng
   - Pause video → progress dừng
   - Seek video → progress cập nhật đúng

2. **Completion validation**
   - Xem < 90% → Không thể complete
   - Xem >= 90% → Có thể complete
   - Complete thành công → Icon và % cập nhật

3. **Edge cases**
   - Video không có duration
   - Network error khi cập nhật
   - Multiple tabs cùng xem video

### **Manual testing:**
```bash
# 1. Tạo lesson có video
curl -X POST "http://localhost:3000/api/courses/1/lessons" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lesson",
    "duration": 600,
    "video_url": "https://example.com/video.mp4"
  }'

# 2. Test completion với watchedDuration < 90%
curl -X POST "http://localhost:3000/api/progress/1" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "completed": true,
    "watchedDuration": 400
  }'
# Expect: Error 400

# 3. Test completion với watchedDuration >= 90%
curl -X POST "http://localhost:3000/api/progress/1" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "completed": true,
    "watchedDuration": 550
  }'
# Expect: Success
```

## Lưu ý

### **Performance**
- Progress tracking chỉ hoạt động khi video đang play
- Dữ liệu được cache local trước khi gửi server
- Sử dụng GREATEST() trong SQL để tránh regression

### **User Experience**
- Thông báo rõ ràng về điều kiện hoàn thành
- Visual cues giúp học viên biết khi nào có thể complete
- Toast notifications thay vì alert popup

### **Security**
- Không thể bypass validation từ frontend
- Server-side validation chặt chẽ
- Tracking progress chống manipulation

## Troubleshooting

### **Vấn đề thường gặp:**

1. **Progress không cập nhật**
   - Kiểm tra lessonId và userId có đúng không
   - Xem console log có error không
   - Kiểm tra video có duration không

2. **Không thể complete dù đã xem hết**
   - Kiểm tra database có record progress không
   - Xem API response có error không
   - Verify calculation: `watchedDuration >= lessonDuration * 0.9`

3. **Icon không đổi màu**
   - Refresh course progress sau khi complete
   - Kiểm tra lessonProgress state update
   - Xem có lỗi trong fetchCourseProgress không

Hệ thống này đảm bảo học viên phải thực sự xem video trước khi có thể hoàn thành bài học, nâng cao chất lượng học tập! 🎯

