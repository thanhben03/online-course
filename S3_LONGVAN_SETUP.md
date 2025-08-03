# Hướng dẫn cấu hình S3 Long Vân Upload với Pre-signed URL

## 1. Cài đặt dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc với nội dung:

```env
# S3 Long Vân Configuration (Backend)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=19428351-course
```

**Lưu ý:** Không sử dụng `NEXT_PUBLIC_` prefix để bảo mật credentials.

## 3. Cấu hình Pre-signed URL

### 3.1 S3 Client Utility (`lib/s3-longvan.ts`)
```typescript
export const generateUploadUrl = async (fileName: string, contentType: string, folder: string = 'uploads') => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || '19428351-course',
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }) // 5 phút
  return { url, key }
}
```

### 3.2 API Route (`app/api/upload-longvan/route.ts`)
- Generate pre-signed URL cho upload
- Validate file type
- Trả về URL và key

### 3.3 Frontend Implementation
```typescript
// Step 1: Get pre-signed URL
const response = await fetch('/api/upload-longvan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileName, contentType, folder })
})

// Step 2: Upload with Referer header
const xhr = new XMLHttpRequest()
xhr.setRequestHeader('Referer', 'http://localhost:3000')
xhr.send(buffer)
```

## 4. Cấu hình Bucket Policy

### 4.1 Thông tin Bucket
- **Bucket Name:** `19428351-course`
- **Endpoint:** `https://s3-hcm5-r1.longvan.net`
- **Region:** `auto`

### 4.2 Bucket Policy với Referer Condition
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "StringLike": {
          "aws:Referer": "http://localhost:3000"
        }
      }
    }
  ]
}
```

### 4.3 Cấu hình CORS (nếu cần)
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["http://localhost:3000"],
        "ExposeHeaders": ["ETag", "x-amz-meta-custom-header"],
        "MaxAgeSeconds": 3000
    }
]
```

## 5. Test Upload

1. Chạy development server:
```bash
npm run dev
```

2. Truy cập: `http://localhost:3000/upload-test`

3. Thử upload file để test chức năng

## 6. Tính năng có sẵn

- ✅ **Pre-signed URL Upload** - Upload an toàn với signed URL
- ✅ **Referer Policy Support** - Hỗ trợ bucket policy với Referer condition
- ✅ **Two-step Process** - Generate URL + Upload
- ✅ **Drag & Drop** upload
- ✅ **File validation** (size, type)
- ✅ **Progress bar** với animation
- ✅ **Preview uploaded files**
- ✅ **Copy URL** to clipboard
- ✅ **Download files**
- ✅ **Custom folder** structure
- ✅ **Error handling**
- ✅ **Configuration display**

## 7. File types được hỗ trợ

- Images: JPG, PNG, GIF
- Documents: PDF
- Text: TXT
- Max size: 10MB

## 8. URL Structure

Files upload sẽ có URL format:
```
https://s3-hcm5-r1.longvan.net/19428351-course/{folder}/{timestamp}-{random}.{extension}
```

## 9. Pre-signed URL Implementation

### 9.1 Backend Process
1. **Generate Key** - Tạo unique key cho file
2. **Create Command** - PutObjectCommand với parameters
3. **Sign URL** - Sử dụng getSignedUrl với expiresIn: 300
4. **Return URL** - Trả về signed URL cho frontend

### 9.2 Frontend Process
1. **Request URL** - Gọi API để lấy pre-signed URL
2. **Upload File** - Sử dụng XMLHttpRequest với Referer header
3. **Handle Response** - Xử lý kết quả upload

### 9.3 Headers được gửi
- `Content-Type`: Loại file
- `Referer`: `http://localhost:3000` (match với policy)

## 10. API Endpoints

### POST `/api/upload-longvan`
**Request:**
```javascript
{
  "fileName": "image.jpg",
  "contentType": "image/jpeg",
  "folder": "uploads"
}
```

**Response:**
```json
{
  "success": true,
  "uploadUrl": "https://s3-hcm5-r1.longvan.net/19428351-course/uploads/1234567890-abc123.jpg?X-Amz-Algorithm=...",
  "key": "uploads/1234567890-abc123.jpg",
  "expiresIn": 300
}
```

## 11. Troubleshooting

### Lỗi Access Denied (Referer Policy)
- **Nguyên nhân:** Referer header không match với policy
- **Giải pháp:** Kiểm tra Referer header được set đúng
- **Debug:** Kiểm tra Network tab trong DevTools

### Lỗi Pre-signed URL Expired
- **Nguyên nhân:** URL đã hết hạn (5 phút)
- **Giải pháp:** Generate URL mới
- **Prevention:** Upload ngay sau khi nhận URL

### Lỗi CORS
- **Nguyên nhân:** Bucket chưa được cấu hình CORS
- **Giải pháp:** Cấu hình CORS cho bucket với origins phù hợp

### Lỗi Network
- Kiểm tra endpoint URL
- Kiểm tra internet connection
- Kiểm tra firewall settings

### Lỗi File Upload
- Kiểm tra file size (max 10MB)
- Kiểm tra file type được hỗ trợ
- Kiểm tra bucket có đủ dung lượng

## 12. Security Benefits

✅ **Bảo mật credentials** - Không expose ở frontend
✅ **Temporary URLs** - URL có thời hạn 5 phút
✅ **Referer Policy** - Chỉ cho phép từ domain cụ thể
✅ **Server-side validation** - Validate file ở backend
✅ **Rate limiting** - Có thể thêm rate limiting
✅ **Authentication** - Có thể thêm authentication

## 13. Production Setup

Để sử dụng trong production:

1. **Environment Variables** - Cấu hình đúng credentials
2. **Authentication** - Thêm authentication cho API
3. **Rate Limiting** - Giới hạn số lượng upload
4. **File Validation** - Validate file types và size
5. **Error Handling** - Xử lý lỗi chi tiết
6. **Monitoring** - Monitor upload activities

## 14. Cấu hình chi tiết

### Bước 1: Đăng nhập S3 Long Vân Console
1. Truy cập: https://s3.longvan.net
2. Đăng nhập với credentials

### Bước 2: Cấu hình Bucket Policy
1. Chọn bucket `19428351-course`
2. Vào tab **Permissions** > **Bucket Policy**
3. Thêm policy như ở mục 4.2

### Bước 3: Test
1. Restart development server
2. Thử upload file
3. Kiểm tra Network tab để xem Referer header
4. Kiểm tra console để xem có lỗi không 