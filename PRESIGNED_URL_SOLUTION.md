# 🎯 Presigned URL Solution - Upload Trực Tiếp Lên S3

## ✅ Đã Implement

### **1. API Generate Presigned URL**
- 📁 `app/api/generate-upload-url/route.ts`
- Server tạo presigned URL cho client upload trực tiếp
- Không handle file → **Không memory leak**

### **2. Updated Frontend**
- 📁 `app/admin/components/VideoUpload.tsx`
- Client upload trực tiếp lên S3 với XMLHttpRequest
- Real-time progress tracking
- **Server không process file**

## 🔄 Upload Flow Mới

```
1. Client → Server: "Tôi muốn upload video.mp4"
2. Server → Client: "Đây là presigned URL, upload trực tiếp lên S3"
3. Client → S3: Upload file trực tiếp (bypass server)
4. Client → Server: "Save file info vào database"
```

## 🚀 Benefits

### **Trước (Server Upload):**
- ❌ File đi qua server → Memory leak 4GB
- ❌ Server process file → CPU cao
- ❌ Timeout issues với file lớn
- ❌ 502 Bad Gateway

### **Sau (Presigned URL):**
- ✅ **Server chỉ tạo URL** → Memory thấp
- ✅ **Client upload trực tiếp** → Nhanh hơn
- ✅ **Không timeout** → S3 handle large files
- ✅ **Không 502** → Server không bị overload

## 📊 Expected Performance

### **Memory Usage:**
```
Before: Node.js 4GB (memory leak)
After:  Node.js 200-500MB (normal)
```

### **Upload Speed:**
```
Before: Client → Server → S3 (2 hops)
After:  Client → S3 (1 hop, faster)
```

### **Stability:**
```
Before: 502 errors với file > 1GB
After:  No server crashes, handle file bất kỳ size
```

## 🛠️ Next Steps

### **1. Test Setup**
```bash
# Deploy code mới lên server
git pull origin main
npm install

# Start với memory limits (vẫn cần cho các tính năng khác)
npm run start:safe
```

### **2. Test Small File**
```bash
# Test API generate URL
curl -X POST https://nhatminhanh.tech/api/generate-upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.mp4","contentType":"video/mp4"}'
```

### **3. Test Large File Upload**
- Upload 1GB+ video qua admin interface
- Monitor server memory: `watch -n 5 'free -h'`
- Expected: Memory stable, không tăng

## 🔍 Troubleshooting

### **Issue: AWS S3 CORS Error**
```bash
# Cần config S3 bucket CORS
# Allow: PUT, POST methods
# Allow: Content-Type header
```

### **Issue: Presigned URL Expired**
```bash
# URL có thời hạn 5 phút
# Client phải upload trong thời gian này
```

### **Issue: File Không Lên S3**
```bash
# Check AWS credentials
# Check bucket permissions
# Check CORS settings
```

## 💡 Key Changes

### **New API Route:**
```typescript
// app/api/generate-upload-url/route.ts
export async function POST(request: NextRequest) {
  const { fileName, contentType } = await request.json()
  const { url, key } = await generateUploadUrl(fileName, contentType)
  return NextResponse.json({ uploadUrl: url, key, finalUrl: '...' })
}
```

### **New Frontend Logic:**
```typescript
// 1. Get presigned URL
const urlResult = await fetch("/api/generate-upload-url", {...})

// 2. Upload trực tiếp lên S3
xhr.open('PUT', urlResult.uploadUrl)
xhr.send(file)

// 3. Save file info sau khi upload thành công
await fetch("/api/admin/uploads", {...})
```

## 🎉 Expected Result

Sau khi implement:
- ✅ Upload 1GB+ video không crash server
- ✅ Memory stable < 1GB
- ✅ Không còn 502 errors
- ✅ Upload nhanh hơn (trực tiếp lên S3)
- ✅ Progress tracking vẫn hoạt động

**Server giờ chỉ làm coordinator, không handle file data! 🚀**
