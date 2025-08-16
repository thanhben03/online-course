# 🎥 Hướng dẫn Upload Video - S3 Long Vân

## 🚀 Upload Video trong 3 bước

### 1. Chuẩn bị
- ✅ Đã setup S3 Long Vân (xem `QUICK_SETUP.md`)
- ✅ File video sẵn sàng (MP4, AVI, MOV, v.v.)

### 2. Upload Video
1. Truy cập: `http://localhost:3000/upload-test`
2. Kéo thả file video hoặc click "Chọn File"
3. Chờ upload hoàn tất (có thể mất vài phút với file lớn)
4. Copy URL video để sử dụng

### 3. Sử dụng Video
```html
<!-- Embed video -->
<video controls width="100%">
  <source src="[URL_VIDEO]" type="video/mp4">
  Your browser does not support the video tag.
</video>

<!-- Hoặc link trực tiếp -->
<a href="[URL_VIDEO]" target="_blank">Xem video</a>
```

## 📹 Hỗ trợ Video Formats

### ✅ Được hỗ trợ:
- **MP4** (.mp4) - Phổ biến nhất
- **AVI** (.avi) - Windows
- **MOV** (.mov) - Apple
- **WMV** (.wmv) - Windows Media
- **FLV** (.flv) - Flash Video
- **WebM** (.webm) - Web optimized
- **MKV** (.mkv) - Open source
- **Và tất cả format khác**

### 🎯 Khuyến nghị:
- **MP4** với H.264 codec (tương thích tốt nhất)
- **WebM** cho web (kích thước nhỏ hơn)
- **Độ phân giải**: 720p hoặc 1080p
- **Bitrate**: 2-5 Mbps cho chất lượng tốt

## 📊 Kích thước File

### ✅ Không giới hạn:
- File nhỏ: < 100MB
- File trung bình: 100MB - 1GB
- File lớn: 1GB - 10GB
- File rất lớn: > 10GB

### ⚠️ Lưu ý:
- File lớn sẽ mất nhiều thời gian upload
- Đảm bảo kết nối internet ổn định
- Có thể cần tăng timeout cho file rất lớn

## 🔧 Cấu hình cho Video Lớn

### 1. Next.js Config
```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3']
  },
  api: {
    bodyParser: {
      sizeLimit: '100mb' // Tăng limit nếu cần
    }
  }
}
```

### 2. Vercel Config (nếu deploy)
```json
// vercel.json
{
  "functions": {
    "app/api/upload-proxy/route.ts": {
      "maxDuration": 300
    }
  }
}
```

## 🎬 Sử dụng Video trong App

### 1. React Component
```tsx
import { useState } from 'react'

export default function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  return (
    <div className="video-container">
      <video 
        controls 
        width="100%" 
        className="rounded-lg shadow-lg"
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        <p>Trình duyệt không hỗ trợ video.</p>
      </video>
    </div>
  )
}
```

### 2. Video Gallery
```tsx
export default function VideoGallery({ videos }: { videos: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((url, index) => (
        <div key={index} className="video-card">
          <video controls className="w-full rounded">
            <source src={url} type="video/mp4" />
          </video>
        </div>
      ))}
    </div>
  )
}
```

## 🚀 Performance Tips

### 1. Video Optimization
- **Compress** video trước khi upload
- **Sử dụng** MP4 với H.264 codec
- **Giảm** bitrate nếu không cần chất lượng cao
- **Cắt** video không cần thiết

### 2. Loading Strategy
```tsx
// Lazy load video
<video 
  controls 
  preload="none" // Không preload
  poster="thumbnail.jpg" // Thumbnail
>
  <source src={videoUrl} type="video/mp4" />
</video>
```

### 3. Progressive Loading
```tsx
// Hiển thị progress khi video đang load
const [loading, setLoading] = useState(true)

<video 
  onLoadedData={() => setLoading(false)}
  onLoadStart={() => setLoading(true)}
>
  {loading && <div>Đang tải video...</div>}
</video>
```

## 🔍 Troubleshooting Video

### 1. Video không phát được
- ✅ Kiểm tra URL có đúng không
- ✅ Kiểm tra format video có được hỗ trợ không
- ✅ Thử mở URL trực tiếp trên browser

### 2. Upload bị lỗi
- ✅ Kiểm tra kết nối internet
- ✅ Thử upload file nhỏ hơn trước
- ✅ Kiểm tra console logs

### 3. Video chậm
- ✅ Sử dụng CDN (nếu có)
- ✅ Compress video
- ✅ Sử dụng format tối ưu

## 📱 Mobile Support

### ✅ Responsive Video
```css
.video-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

### ✅ Touch Controls
- Video controls tự động responsive
- Hỗ trợ touch gestures
- Fullscreen mode trên mobile

## 🎉 Kết luận

Với setup này, bạn có thể:
- ✅ Upload video không giới hạn kích thước
- ✅ Hỗ trợ tất cả format video
- ✅ Embed video vào website
- ✅ Responsive trên mọi thiết bị
- ✅ Performance tối ưu

**Happy Video Uploading! 🎬** 