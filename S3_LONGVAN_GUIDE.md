# Hướng dẫn Setup và Sử dụng S3 Long Vân

## 📋 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt Dependencies](#cài-đặt-dependencies)
3. [Cấu hình Environment Variables](#cấu-hình-environment-variables)
4. [Cấu hình S3 Long Vân](#cấu-hình-s3-long-vân)
5. [Cấu trúc Code](#cấu-trúc-code)
6. [API Endpoints](#api-endpoints)
7. [Sử dụng Frontend](#sử-dụng-frontend)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## 🎯 Giới thiệu

S3 Long Vân là dịch vụ lưu trữ đám mây tương thích với AWS S3, được cung cấp bởi Long Vân. Hướng dẫn này sẽ giúp bạn tích hợp S3 Long Vân vào ứng dụng Next.js.

### Tính năng chính:
- ✅ Upload file trực tiếp qua backend (tránh CORS)
- ✅ Hỗ trợ tất cả loại file (video, hình ảnh, tài liệu, v.v.)
- ✅ Không giới hạn kích thước file
- ✅ Tạo URL public cho file
- ✅ Progress tracking
- ✅ Error handling chi tiết

## 📦 Cài đặt Dependencies

```bash
# Cài đặt AWS SDK
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Cài đặt formidable (nếu cần)
npm install formidable @types/formidable --legacy-peer-deps
```

## 🔧 Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc:

```env
# S3 Long Vân Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=19428351-course
```

### Lấy credentials từ S3 Long Vân:
1. Đăng nhập vào Long Vân Cloud Console
2. Tạo Access Key và Secret Key
3. Tạo bucket hoặc sử dụng bucket có sẵn
4. Copy credentials vào file `.env.local`

## ⚙️ Cấu hình S3 Long Vân

### 1. Bucket Policy (Tùy chọn)
Nếu muốn giới hạn access theo domain:

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

### 2. CORS Configuration (Tùy chọn)
Nếu muốn upload trực tiếp từ frontend:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```

## 🏗️ Cấu trúc Code

### 1. S3 Client Configuration (`lib/s3-longvan.ts`)

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://s3-hcm5-r1.longvan.net',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true
})

// Các functions export
export const uploadToS3LongVan = async (file: Buffer, key: string, contentType: string)
export const deleteFromS3LongVan = async (key: string)
export const getSignedDownloadUrl = async (key: string, expiresIn = 3600)
export const generateS3Key = (fileName: string, folder: string = 'uploads')
export default s3Client
```

### 2. API Route (`app/api/upload-proxy/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3LongVan, generateS3Key } from "@/lib/s3-longvan"

export async function POST(request: NextRequest) {
  // Xử lý upload file
  // Validation
  // Upload lên S3
  // Trả về response
}
```

### 3. Frontend Component (`app/upload-test/page.tsx`)

```typescript
"use client"
import { useState, useRef } from "react"
// ... imports

export default function UploadTestPage() {
  // State management
  // File handling
  // Upload logic
  // UI rendering
}
```

## 🔌 API Endpoints

### POST `/api/upload-proxy`

**Request:**
```
FormData:
- file: File object
```

**Response:**
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

**Error Response:**
```json
{
  "error": "Error message"
}
```

## 🎨 Sử dụng Frontend

### 1. Truy cập trang test
```
http://localhost:3000/upload-test
```

### 2. Upload file
- Kéo thả file hoặc click chọn file
- Hỗ trợ tất cả loại file: Video, hình ảnh, tài liệu, v.v.
- Không giới hạn kích thước file
- Xem progress bar
- Nhận URL sau khi upload thành công

### 3. Tính năng
- ✅ Drag & drop
- ✅ File validation
- ✅ Progress tracking
- ✅ Copy URL
- ✅ Download file
- ✅ Responsive design

## 🔧 Troubleshooting

### 1. Lỗi "Missing AWS credentials"
**Nguyên nhân:** Chưa tạo file `.env.local`
**Giải pháp:**
```bash
# Tạo file .env.local
echo "AWS_ACCESS_KEY_ID=your_key" > .env.local
echo "AWS_SECRET_ACCESS_KEY=your_secret" >> .env.local
echo "AWS_S3_BUCKET=your_bucket" >> .env.local

# Restart server
npm run dev
```

### 2. Lỗi "Invalid AWS credentials"
**Nguyên nhân:** Credentials sai hoặc không có quyền
**Giải pháp:**
- Kiểm tra Access Key và Secret Key
- Đảm bảo credentials có quyền upload
- Kiểm tra bucket name

### 3. Lỗi "Bucket not found"
**Nguyên nhân:** Bucket không tồn tại hoặc sai tên
**Giải pháp:**
- Kiểm tra bucket name trong `.env.local`
- Đảm bảo bucket tồn tại trong S3 Long Vân

### 4. Lỗi "Network error"
**Nguyên nhân:** Endpoint sai hoặc mạng có vấn đề
**Giải pháp:**
- Kiểm tra endpoint URL
- Kiểm tra internet connection
- Thử ping endpoint

### 5. Lỗi CORS
**Nguyên nhân:** Upload trực tiếp từ frontend
**Giải pháp:**
- Sử dụng proxy API (đã implement)
- Hoặc cấu hình CORS cho bucket

## 📊 Best Practices

### 1. Security
- ✅ Không expose credentials ra frontend
- ✅ Sử dụng proxy API
- ✅ Validate file type và size
- ✅ Generate unique file names

### 2. Performance
- ✅ Compress images trước khi upload
- ✅ Sử dụng CDN cho public files
- ✅ Implement retry logic
- ✅ Monitor upload progress

### 3. Error Handling
- ✅ Log errors chi tiết
- ✅ Provide user-friendly error messages
- ✅ Implement fallback mechanisms
- ✅ Validate input data

### 4. File Management
- ✅ Organize files by folder structure
- ✅ Implement file deletion
- ✅ Set appropriate file permissions
- ✅ Monitor storage usage

## 🚀 Deployment

### 1. Production Environment
```env
# .env.production
AWS_ACCESS_KEY_ID=prod_access_key
AWS_SECRET_ACCESS_KEY=prod_secret_key
AWS_S3_BUCKET=prod_bucket_name
```

### 2. Vercel Deployment
- Thêm environment variables trong Vercel dashboard
- Deploy code
- Test upload functionality

### 3. Security Considerations
- Sử dụng IAM roles thay vì access keys (nếu có thể)
- Implement rate limiting
- Monitor access logs
- Regular security audits

## 📝 Logs và Monitoring

### Console Logs
```
Starting proxy upload...
File received: { name: 'test.jpg', size: 12345, type: 'image/jpeg' }
Environment variables check passed
Generated key: uploads/1234567890-abc123.jpg
File converted to buffer, size: 12345
Uploading to S3...
S3 upload successful
Generated URL: https://s3-hcm5-r1.longvan.net/...
```

### Error Logs
```
Proxy upload error: Error details
Error message: Specific error
Error stack: Stack trace
```

## 🎉 Kết luận

Với setup này, bạn có thể:
- ✅ Upload file an toàn lên S3 Long Vân
- ✅ Tránh các vấn đề CORS
- ✅ Có UI/UX tốt cho người dùng
- ✅ Dễ dàng maintain và scale

Hệ thống đã sẵn sàng cho production use! 🚀 