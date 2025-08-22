# Sửa lỗi duration = 0 trong hệ thống validation

## Vấn đề được phát hiện:

**Error response:**
```json
{
  "success": false,
  "error": "Bạn cần xem ít nhất 90% video để hoàn thành bài học",
  "details": {
    "watchedPercentage": 0,
    "requiredPercentage": 90,
    "watchedDuration": 8,
    "totalDuration": 0  // ← Đây là vấn đề!
  }
}
```

## Nguyên nhân:

1. **Lesson duration = 0** trong database
2. **Frontend** báo "có thể hoàn thành" dựa trên video metadata
3. **Backend** validation failed vì lesson.duration = 0

## Giải pháp đã triển khai:

### 1. **Auto-update duration từ video metadata**
```typescript
// VideoPlayer tự động cập nhật lesson duration
const handleLoadedMetadata = async () => {
  const videoDuration = Math.floor(video.duration)
  
  // Update lesson duration in database
  await fetch(`/api/lessons/${lessonId}/update-duration`, {
    method: 'POST',
    body: JSON.stringify({ duration: videoDuration })
  })
}
```

### 2. **API endpoint mới: `/api/lessons/[id]/update-duration`**
- Cập nhật duration của lesson từ video metadata
- Chỉ update nếu current duration = 0 hoặc khác biệt > 10%
- Tránh việc override duration đã được set manual

### 3. **Enhanced progress validation API**
```typescript
// /api/progress/[lessonId] - Cải tiến validation
if (lessonDuration === 0 && totalDuration > 0) {
  // Auto-update lesson duration from video
  await sql`UPDATE lessons SET duration = ${totalDuration} WHERE id = ${lessonId}`
  lessonDuration = totalDuration
}

// Special handling for duration = 0
if (lessonDuration === 0) {
  return {
    error: "Không thể xác định thời lượng video. Vui lòng tải lại trang và xem lại video."
  }
}
```

### 4. **Frontend improvements**
```typescript
// Gửi cả totalDuration khi update progress
const result = await apiClient.updateLessonProgress(lessonId, {
  userId: userInfo.id,
  completed,
  watchedDuration,
  totalDuration // ← New: Include video duration
})

// Improved canCompleteCurrentLesson logic
const canCompleteCurrentLesson = () => {
  // Try video progress first
  if (videoProgress.totalDuration > 0) {
    return videoProgress.percentageWatched >= 90
  }
  
  // Fallback to stored progress
  const storedProgress = lessonProgress[currentLesson.id]
  if (storedProgress?.duration > 0) {
    const percentage = (storedProgress.watched_duration / storedProgress.duration) * 100
    return percentage >= 90
  }
  
  return false // Can't validate without duration
}
```

## Luồng hoạt động mới:

### **Khi load video lần đầu:**
1. VideoPlayer load metadata → có `video.duration`
2. Tự động call `/api/lessons/${lessonId}/update-duration` 
3. Update lesson.duration trong database
4. Từ giờ validation sẽ hoạt động đúng

### **Khi progress tracking:**
1. Gửi cả `watchedDuration` và `totalDuration` lên server
2. Nếu lesson.duration = 0, auto-update từ `totalDuration`
3. Validation dựa trên duration mới được update

### **Khi completion validation:**
1. Kiểm tra lesson.duration > 0
2. Nếu = 0: Trả về lỗi rõ ràng và hướng dẫn reload
3. Nếu > 0: Validate như bình thường

## Test cases:

### **Case 1: Lesson mới không có duration**
```bash
# Tạo lesson với duration = 0
curl -X POST "http://localhost:3000/api/courses/1/lessons" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "duration": 0, "video_url": "video.mp4"}'

# Xem video → Duration sẽ tự động được update
```

### **Case 2: Video load thành công**
```bash
# Check duration đã được update
curl "http://localhost:3000/api/courses/1/lessons"
# Expect: lesson.duration > 0
```

### **Case 3: Completion validation**
```bash
# Try complete với duration đã được update
curl -X POST "http://localhost:3000/api/progress/1" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "completed": true,
    "watchedDuration": 540,
    "totalDuration": 600
  }'
# Expect: Success nếu 540/600 >= 90%
```

## Preventive measures:

1. **Always include totalDuration** khi call progress API
2. **Auto-update duration** từ video metadata khi có thể
3. **Clear error messages** khi không thể validate
4. **Fallback logic** trong frontend validation
5. **Debug logging** để track duration updates

## Recovery steps nếu gặp lỗi:

1. **Reload trang** để trigger metadata load lại
2. **Play video** một chút để trigger duration update
3. **Check network tab** xem API calls có thành công không
4. **Manual update** duration qua admin nếu cần:

```sql
UPDATE lessons SET duration = 600 WHERE id = 1;
```

Giờ đây hệ thống sẽ tự động sync duration giữa video metadata và database! 🎯




