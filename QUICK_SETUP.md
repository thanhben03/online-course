# 🚀 Quick Setup - S3 Long Vân

## ⚡ Setup trong 5 phút

### 1. Cài đặt Dependencies
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Tạo file `.env.local`
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=19428351-course
```

### 3. Restart Server
```bash
npm run dev
```

### 4. Test Upload
Truy cập: `http://localhost:3000/upload-test`

## ✅ Done!

Hệ thống đã sẵn sàng upload file lên S3 Long Vân!

---

## 📋 Checklist

- [ ] Cài đặt dependencies
- [ ] Tạo `.env.local` với credentials thực
- [ ] Restart server
- [ ] Test upload file nhỏ (< 1MB)
- [ ] Kiểm tra console logs
- [ ] Verify file URL

## 🔧 Nếu gặp lỗi

1. **Missing credentials**: Kiểm tra `.env.local`
2. **Invalid credentials**: Verify Access Key/Secret Key
3. **Bucket not found**: Kiểm tra bucket name
4. **Network error**: Kiểm tra internet connection

## 📚 Tài liệu chi tiết

- [S3 Long Vân Guide](./S3_LONGVAN_GUIDE.md)
- [Debug Upload](./DEBUG_UPLOAD.md)
- [Main README](./README.md)

---

**Happy Uploading! 🎉** 