# 🚨 Debug S3 Upload Issues - 403 Forbidden

## 🔍 Current Error Analysis

### **Error:** 403 Forbidden
```
PUT https://s3-hcm5-r1.longvan.net/19430110-courses/uploads/...
net::ERR_FAILED 403 (Forbidden)
```

### **Possible Causes:**

1. **CORS Not Configured** ❌
   - S3 bucket không có CORS policy
   - Origin `https://nhatminhanh.tech` not allowed

2. **ACL Permission Issue** ❌
   - `ACL: 'public-read'` không được support
   - Bucket policy restrict uploads

3. **Presigned URL Signature** ❌
   - Headers không match signed headers
   - Content-Type mismatch

4. **Bucket Permissions** ❌
   - User không có quyền PUT object
   - Bucket policy deny uploads

## ✅ Fixes Applied

### **1. Simplified Presigned URL**
```typescript
// Removed ACL and complex headers
const command = new PutObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET || '19430110-courses',
  Key: key,
  ContentType: contentType,
  // Removed: ACL: 'public-read'
})

const url = await getSignedUrl(s3Client, command, { 
  expiresIn: 300
  // Removed complex signableHeaders
})
```

### **2. Smart Fallback System**
```typescript
try {
  // Try presigned URL first
  result = await uploadToS3Direct(file)
} catch (error) {
  if (error === 'CORS_ERROR' || error === 'S3_PERMISSION_ERROR') {
    // Fallback to server upload
    result = await uploadViaServer(file)
  }
}
```

## 🧪 Debug Steps

### **Test 1: Check Presigned URL**
```bash
# Test presigned URL generation
curl -X POST http://localhost:3000/api/generate-upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.mp4","contentType":"video/mp4"}'

# Should return URL without errors
```

### **Test 2: Manual Upload Test**
```bash
# Test với curl (bypass CORS)
curl -X PUT "PRESIGNED_URL_HERE" \
  -H "Content-Type: video/mp4" \
  --data-binary @test.mp4

# Expected: 200 OK hoặc 204 No Content
```

### **Test 3: Check S3 Credentials**
```bash
# Test S3 connection
aws s3 ls s3://19430110-courses \
  --endpoint-url https://s3-hcm5-r1.longvan.net

# Should list bucket contents
```

### **Test 4: Browser Console Test**
```javascript
// Test CORS preflight trong browser console
fetch('https://s3-hcm5-r1.longvan.net/19430110-courses/', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://nhatminhanh.tech',
    'Access-Control-Request-Method': 'PUT'
  }
}).then(r => console.log('CORS Status:', r.status))
```

## 🎯 Priority Actions

### **Immediate (System Still Works):**
- ✅ Smart fallback implemented
- ✅ Upload sẽ work qua server khi S3 fail
- ✅ Console log show fallback reason

### **Next Steps:**

#### **1. Fix CORS (Critical)**
- Setup CORS policy trong Long Van console
- Allow origins: `nhatminhanh.tech`
- Allow methods: `PUT, OPTIONS`

#### **2. Check Bucket Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::19430110-courses/*"
    }
  ]
}
```

#### **3. Test ACL Support**
```typescript
// Try without ACL first
const command = new PutObjectCommand({
  Bucket: '19430110-courses',
  Key: key,
  ContentType: contentType
  // No ACL
})
```

## 📊 Expected Behavior

### **Current (with fallback):**
1. Try presigned URL → 403 Forbidden
2. Console: "🔄 S3_PERMISSION_ERROR: Falling back to server upload..."
3. Upload via server → Success
4. ⚠️ Memory usage higher (temporary)

### **After fixes:**
1. Try presigned URL → Success
2. Upload direct to S3 → Fast
3. ✅ Memory usage low
4. 🚀 No server processing

## 🔧 Quick Test Commands

```bash
# 1. Test upload (should work with fallback)
# Upload một file nhỏ trong admin

# 2. Check console logs
# Should see: "Falling back to server upload..."

# 3. Monitor memory
watch -n 5 'free -h && ps aux | grep next | head -2'

# 4. After CORS fix, test again
# Should see: "✅ File uploaded successfully to S3"
```

## 💡 Long-term Solution

1. **Contact Long Van Support**
   - Request CORS setup
   - Request bucket policy review
   - Ask about ACL support

2. **Alternative: Direct Server Upload**
   - Keep fallback as primary method
   - Still better than original memory leak

3. **Monitor & Optimize**
   - Track which method succeeds
   - Optimize based on results

**Current system stable với smart fallback! 🚀**
