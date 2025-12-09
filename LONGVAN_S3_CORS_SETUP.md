# 🔧 Long Van S3 CORS Setup Guide

## 🚨 Current Error
```
Access to XMLHttpRequest at 'https://s3-hcm5-r1.longvan.net/19430110-courses/...' 
from origin 'https://nhatminhanh.tech' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 💡 Solution: Setup CORS Policy trên Long Van S3

### **Method 1: Long Van Console (Recommended)**

#### **Step 1: Access Long Van Console**
1. Truy cập: **https://console.longvan.net**
2. Login với credentials của bạn

#### **Step 2: Navigate to S3**
1. Click **"Storage"** hoặc **"S3"** trong menu
2. Chọn bucket: **`19430110-courses`**

#### **Step 3: Setup CORS Policy**
1. Tìm tab **"Permissions"** hoặc **"CORS"** 
2. Click **"Edit CORS configuration"**
3. Paste config này:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT", 
            "POST",
            "DELETE",
            "HEAD",
            "OPTIONS"
        ],
        "AllowedOrigins": [
            "https://nhatminhanh.tech",
            "https://www.nhatminhanh.tech",
            "http://localhost:3000",
            "http://localhost:3001"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-version-id",
            "x-amz-request-id"
        ],
        "MaxAgeSeconds": 3600
    }
]
```

4. Click **"Save"** hoặc **"Apply"**

### **Method 2: Contact Long Van Support**

Nếu không tìm thấy CORS settings:

**📧 Email Support:**
- **To:** support@longvan.net
- **Subject:** Request CORS Setup for S3 Bucket
- **Content:**

```
Chào Long Van Support,

Tôi cần setup CORS policy cho S3 bucket: 19430110-courses

Domain cần allow: 
- https://nhatminhanh.tech
- https://www.nhatminhanh.tech
- http://localhost:3000

Methods cần allow: GET, PUT, POST, DELETE, HEAD, OPTIONS
Headers cần allow: * (all headers)

Mục đích: Upload files từ web application trực tiếp lên S3.

Cảm ơn!
```

### **Method 3: AWS CLI (nếu có credentials)**

```bash
# Create CORS config file
cat > longvan-cors.json << 'EOF'
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
            "AllowedOrigins": [
                "https://nhatminhanh.tech",
                "https://www.nhatminhanh.tech", 
                "http://localhost:3000"
            ],
            "ExposeHeaders": ["ETag", "x-amz-version-id", "x-amz-request-id"],
            "MaxAgeSeconds": 3600
        }
    ]
}
EOF

# Apply CORS (thay credentials của bạn)
aws s3api put-bucket-cors \
  --bucket 19430110-courses \
  --cors-configuration file://longvan-cors.json \
  --endpoint-url https://s3-hcm5-r1.longvan.net \
  --region auto
```

## 🧪 Test CORS After Setup

### **Test 1: Browser Console**
```javascript
// Chạy trong browser console của https://nhatminhanh.tech
fetch('https://s3-hcm5-r1.longvan.net/19430110-courses/', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://nhatminhanh.tech',
    'Access-Control-Request-Method': 'PUT',
    'Access-Control-Request-Headers': 'Content-Type'
  }
}).then(response => {
  console.log('CORS Headers:', response.headers);
  console.log('Status:', response.status);
}).catch(err => console.error('CORS Test Failed:', err));
```

### **Test 2: curl Command**
```bash
# Test preflight request
curl -v -X OPTIONS \
  -H "Origin: https://nhatminhanh.tech" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://s3-hcm5-r1.longvan.net/19430110-courses/

# Expected response headers:
# Access-Control-Allow-Origin: https://nhatminhanh.tech
# Access-Control-Allow-Methods: PUT, POST, GET, DELETE, HEAD, OPTIONS
# Access-Control-Allow-Headers: *
```

### **Test 3: Upload Test**
```bash
# Test actual PUT upload
curl -v -X PUT \
  -H "Origin: https://nhatminhanh.tech" \
  -H "Content-Type: video/mp4" \
  --data-binary @test.mp4 \
  "YOUR_PRESIGNED_URL_HERE"
```

## 📋 CORS Configuration Explained

### **AllowedOrigins:**
- `https://nhatminhanh.tech` - Production domain
- `https://www.nhatminhanh.tech` - WWW variant  
- `http://localhost:3000` - Development

### **AllowedMethods:**
- `PUT` - Upload với presigned URL
- `POST` - Alternative upload method
- `OPTIONS` - Preflight requests (required)
- `GET` - Download files
- `HEAD` - Check file existence
- `DELETE` - Remove files

### **AllowedHeaders:**
- `*` - Allow all headers (includes Content-Type, x-amz-*)

### **ExposeHeaders:**
- `ETag` - File checksum
- `x-amz-version-id` - Object version
- `x-amz-request-id` - Request tracking

## ✅ Success Indicators

Sau khi CORS được setup:

1. **Browser Console:** Không còn CORS error
2. **Network Tab:** PUT request thành công (200/204)  
3. **File Upload:** Video appear trong S3 bucket
4. **Application:** Upload progress hiển thị bình thường

## 🚀 Expected Upload Flow

```
1. User chọn file → ✅
2. Frontend call /api/generate-upload-url → ✅  
3. Server tạo presigned URL → ✅
4. Frontend PUT file trực tiếp lên S3 → ❌ (CORS blocked)
5. S3 return success → ✅ (sau khi fix CORS)
```

## 📞 Quick Contact Info

**Long Van Support:**
- **Email:** support@longvan.net
- **Website:** https://longvan.net
- **Console:** https://console.longvan.net

**Request:** "Please setup CORS policy for bucket 19430110-courses to allow uploads from nhatminhanh.tech"

## 🎯 Priority Action

**Setup CORS policy ngay** để presigned URL hoạt động và tránh memory leak trên server!

1. Login Long Van Console
2. Find bucket 19430110-courses  
3. Setup CORS với config trên
4. Test upload → Should work without errors

**Presigned URL là solution tốt nhất để tránh server memory leak! 🚀**
