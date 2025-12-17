# 🔧 Fix Video Read Permission - Bucket Policy Solution

## 🚨 Vấn đề hiện tại
Sau khi upload video lên S3, không thể đọc/xem video vì thiếu quyền public read access.

## 🔍 Nguyên nhân
1. **ACL conflict:** `ACL: 'public-read'` trong presigned URL gây conflict với S3 Long Vân
2. **Thiếu Bucket Policy:** Không có policy cho phép public read access

## ✅ Giải pháp đã áp dụng

### 1. Remove ACL khỏi Upload Commands
- ✅ Removed ACL từ `generateUploadUrl()`
- ✅ Removed ACL từ `uploadToS3LongVan()`
- ✅ Removed ACL từ `uploadStreamToS3LongVan()`

### 2. Cần setup Bucket Policy

## 🎯 HÀNH ĐỘNG CẦN LÀM NGAY

### Cách 1: Long Van Console (Khuyên dùng)

1. **Truy cập Long Van Console:**
   ```
   https://console.longvan.net
   ```

2. **Navigate đến S3 bucket:**
   - Chọn bucket: `19430110-courses`
   - Tìm tab "Permissions" hoặc "Bucket Policy"

3. **Thêm Bucket Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::19430110-courses/*"
       }
     ]
   }
   ```

### Cách 2: Contact Long Van Support

**📧 Email:** support@longvan.net
**Subject:** Request Public Read Access for S3 Bucket

**Nội dung:**
```
Chào Long Van Support,

Tôi cần setup public read access cho S3 bucket: 19430110-courses

Hiện tại sau khi upload file, không thể truy cập public URL:
https://s3-hcm5-r1.longvan.net/19430110-courses/uploads/...

Cần setup bucket policy để allow public read:
- Action: s3:GetObject
- Resource: arn:aws:s3:::19430110-courses/*
- Principal: * (public access)

Cảm ơn!
```

### Cách 3: AWS CLI (nếu có access)

```bash
# Tạo policy file
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::19430110-courses/*"
    }
  ]
}
EOF

# Apply policy
aws s3api put-bucket-policy \
  --bucket 19430110-courses \
  --policy file://bucket-policy.json \
  --endpoint-url https://s3-hcm5-r1.longvan.net \
  --region auto
```

## 🧪 Test sau khi setup

### Test 1: Direct URL access
```bash
# Test truy cập trực tiếp video URL
curl -I https://s3-hcm5-r1.longvan.net/19430110-courses/uploads/[FILE_KEY]

# Expected: 200 OK thay vì 403 Forbidden
```

### Test 2: Browser test
```javascript
// Test trong browser console
fetch('https://s3-hcm5-r1.longvan.net/19430110-courses/uploads/[FILE_KEY]')
  .then(response => console.log('Status:', response.status))
  .catch(err => console.error('Error:', err))

// Expected: Status: 200
```

### Test 3: Video player test
```html
<!-- Test trong HTML -->
<video controls width="100%">
  <source src="https://s3-hcm5-r1.longvan.net/19430110-courses/uploads/[FILE_KEY]" type="video/mp4">
</video>

<!-- Expected: Video loads và plays without errors -->
```

## 📊 Expected Results

**Trước khi fix:**
```
❌ 403 Forbidden when accessing video URL
❌ Video player không load được
❌ Cannot read uploaded videos
```

**Sau khi fix:**
```
✅ 200 OK when accessing video URL  
✅ Video player loads successfully
✅ Can read and play uploaded videos
✅ Public access works correctly
```

## 🚀 Priority Action

**SETUP BUCKET POLICY NGAY** để:
1. ✅ Video có thể được xem sau upload
2. ✅ Public URLs work correctly  
3. ✅ Video player functionality restored
4. ✅ User experience improved

**Contact Long Van Support nếu không tìm thấy Bucket Policy settings trong console!**
