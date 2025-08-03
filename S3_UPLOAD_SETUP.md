# Hướng dẫn cấu hình S3 Upload

## 1. Cài đặt dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc với nội dung:

```env
# AWS S3 Configuration
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=your_bucket_name_here
```

## 3. Cấu hình AWS S3 Bucket

### 3.1 Tạo S3 Bucket
1. Đăng nhập vào AWS Console
2. Tạo S3 bucket mới
3. Chọn region phù hợp (khuyến nghị: ap-southeast-1)
4. Cấu hình bucket settings

### 3.2 Cấu hình CORS (nếu cần)
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 3.3 Cấu hình Bucket Policy (cho public access)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

## 4. Tạo IAM User

1. Tạo IAM user mới
2. Gán policy sau:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

3. Tạo Access Key và Secret Key
4. Cập nhật vào `.env.local`

## 5. Test Upload

1. Chạy development server:
```bash
npm run dev
```

2. Truy cập: `http://localhost:3000/upload-test`

3. Thử upload file để test chức năng

## 6. Tính năng có sẵn

- ✅ Drag & Drop upload
- ✅ File validation (size, type)
- ✅ Progress bar
- ✅ Preview uploaded files
- ✅ Copy URL to clipboard
- ✅ Download files
- ✅ Custom folder structure
- ✅ Error handling

## 7. File types được hỗ trợ

- Images: JPG, PNG, GIF
- Documents: PDF
- Text: TXT
- Max size: 10MB

## 8. Troubleshooting

### Lỗi Access Denied
- Kiểm tra IAM permissions
- Kiểm tra bucket policy
- Kiểm tra CORS configuration

### Lỗi Region
- Đảm bảo AWS_REGION khớp với bucket region

### Lỗi Bucket not found
- Kiểm tra tên bucket trong .env.local
- Đảm bảo bucket tồn tại và accessible 