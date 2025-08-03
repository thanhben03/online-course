# Debug Upload Issues - Proxy API Approach

## 1. Tạo file .env.local

Tạo file `.env.local` trong thư mục gốc:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=19428351-course
```

**Thay thế credentials thực từ S3 Long Vân**

## 2. Kiểm tra Console Logs

Sau khi thử upload, kiểm tra terminal console để xem logs:

- `Starting proxy upload...`
- `File received: {...}`
- `Environment variables check passed`
- `Generated key: ...`
- `File converted to buffer, size: ...`
- `Uploading to S3...`
- `S3 upload successful`
- `Generated URL: ...`

## 3. Flow Upload hiện tại

1. **Frontend** gửi FormData với file
2. **Backend** nhận file và upload trực tiếp lên S3
3. **Backend** trả về URL và thông tin file
4. **Frontend** hiển thị kết quả

## 4. Các lỗi thường gặp

### Missing AWS credentials
- Tạo file `.env.local`
- Restart server

### Invalid AWS credentials
- Kiểm tra Access Key và Secret Key
- Đảm bảo credentials có quyền upload

### Bucket not found
- Kiểm tra bucket name
- Đảm bảo bucket tồn tại

### Network error
- Kiểm tra endpoint URL
- Kiểm tra internet connection

## 5. Test Upload

1. **Tạo file `.env.local`** với credentials thực
2. **Restart server**: `npm run dev`
3. **Truy cập**: `http://localhost:3000/upload-test`
4. **Chọn file nhỏ** (< 1MB) để test
5. **Kiểm tra console logs**

## 6. Cấu trúc API

**Request**: `POST /api/upload-proxy`
```
FormData:
- file: File object
```

**Response**:
```json
{
  "success": true,
  "url": "https://s3-hcm5-r1.longvan.net/19428351-course/uploads/1234567890-abc123.jpg",
  "key": "uploads/1234567890-abc123.jpg",
  "fileName": "test.jpg",
  "fileSize": 12345,
  "fileType": "image/jpeg"
}
```

## 7. Ưu điểm của Proxy API

- ✅ Không có vấn đề CORS
- ✅ Bảo mật credentials (không expose ra frontend)
- ✅ Validation ở backend
- ✅ Dễ debug và maintain 