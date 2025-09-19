# 🚀 Setup Sau Khi Upload Code Lên Server

## ⚡ Quick Start (3 Commands)

```bash
# 1. Install dependencies với memory limits
NODE_OPTIONS='--max-old-space-size=1024' npm install

# 2. Fix memory leak ngay
sudo bash emergency-restart.sh

# 3. Monitor để đảm bảo ổn định
watch -n 5 'free -h && ps aux | grep next | head -2'
```

## 📋 Step-by-Step Setup

### **Bước 1: Chuẩn Bị Environment**
```bash
# SSH vào server
ssh username@nhatminhanh.tech

# Navigate đến project directory
cd /path/to/your/online-course-platform

# Check current memory status
free -h
ps aux | grep node
```

### **Bước 2: Install Dependencies Safely**
```bash
# Stop tất cả Node.js processes trước
pkill -f "next" 2>/dev/null || true

# Install với memory limit để tránh crash
NODE_OPTIONS='--max-old-space-size=1024' npm install

# Hoặc nếu dùng yarn
NODE_OPTIONS='--max-old-space-size=1024' yarn install
```

### **Bước 3: Setup Environment Variables**
```bash
# Tạo .env.local với AWS credentials
nano .env.local

# Thêm vào file:
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key  
# AWS_S3_BUCKET=your_bucket_name
```

### **Bước 4: Fix Memory Leak (CRITICAL)**
```bash
# Chạy script fix memory leak
sudo bash fix-memory-leak.sh

# Script này sẽ:
# - Setup memory limits
# - Tạo monitoring service
# - Optimize system cho 4GB VPS
```

### **Bước 5: Fix Nginx Configuration**
```bash
# Fix nginx config để tránh 502
sudo bash fix-502-now.sh

# Hoặc manual update nginx:
sudo nano /etc/nginx/sites-available/default
# Copy config từ nginx-fix-502.conf
sudo nginx -t
sudo systemctl reload nginx
```

### **Bước 6: Start Application Safely**
```bash
# Option 1: PM2 (Khuyến nghị)
npm install -g pm2
pm2 start npm --name "upload-app" --max-memory-restart 1536M -- run start:safe
pm2 startup
pm2 save

# Option 2: Direct npm
npm run start:safe

# Option 3: Emergency restart nếu có vấn đề
bash emergency-restart.sh
```

### **Bước 7: Verify Setup**
```bash
# Test API endpoint
curl -X POST https://nhatminhanh.tech/api/upload-proxy

# Check memory usage (phải < 80%)
free -h

# Check Node.js memory (phải < 1.5GB)
ps aux | grep next

# Check nginx status
sudo systemctl status nginx
```

## 🔍 Troubleshooting Checklist

### **Nếu Memory Vẫn Cao:**
```bash
# 1. Emergency restart
bash emergency-restart.sh

# 2. Check processes
ps aux --sort=-%mem | head -10

# 3. Monitor real-time
watch -n 3 'free -h && ps aux | grep next | head -2'
```

### **Nếu Vẫn Lỗi 502:**
```bash
# 1. Check nginx logs
sudo tail -f /var/log/nginx/error.log

# 2. Test Node.js direct
curl http://localhost:3000

# 3. Restart services
sudo systemctl restart nginx
pm2 restart upload-app
```

### **Nếu Upload Vẫn Fail:**
```bash
# 1. Check upload logs
sudo tail -f /var/log/nginx/upload.log

# 2. Test small file first
curl -X POST -F "file=@small-test.mp4" https://nhatminhanh.tech/api/upload-proxy

# 3. Check AWS credentials
cat .env.local
```

## 📊 Expected Status After Setup

### **Memory Usage (Good):**
```
Total: 4GB
Used: 2.5-3GB (60-75%)
Available: 1-1.5GB
Node.js: 800MB-1.2GB
```

### **Processes Running:**
```
✅ nginx (master + workers)
✅ node/next (1 process, <1.5GB)
✅ pm2 (nếu dùng)
✅ ssh, systemd services
```

### **Services Status:**
```bash
# All should be active
sudo systemctl status nginx
sudo systemctl status memory-guard  # Nếu đã setup
pm2 status  # Nếu dùng PM2
```

## 🚀 Final Test Commands

### **Test Upload 1GB Video:**
```bash
# 1. Monitor trong terminal 1
watch -n 5 'free -h && ps aux | grep next | head -2'

# 2. Test upload trong terminal 2  
curl -X POST -F "file=@1gb-video.mp4" https://nhatminhanh.tech/api/upload-proxy

# 3. Check logs trong terminal 3
sudo tail -f /var/log/nginx/upload.log
```

### **Expected Results:**
- ✅ Memory stable < 80%
- ✅ No 502 errors
- ✅ Upload completes trong 10-15 phút
- ✅ Progress tracking works

## 🛠️ Maintenance Commands

### **Daily Monitoring:**
```bash
# Quick health check
bash debug-upload-now.sh

# Memory status
free -h && ps aux | grep next
```

### **Weekly Maintenance:**
```bash
# Clear logs
sudo truncate -s 0 /var/log/nginx/*.log

# Update packages
npm update

# Restart services
pm2 restart all && sudo systemctl reload nginx
```

## 🎯 Success Indicators

Sau khi setup thành công:

1. **Memory**: Node.js dùng 800MB-1.2GB (không phải 4GB)
2. **CPU**: Load average < 2.0
3. **Upload**: 1GB video upload thành công
4. **No 502**: Không còn lỗi Bad Gateway
5. **Stable**: Server ổn định sau upload

**🎉 Setup hoàn tất! Bây giờ có thể upload video 1GB+ an toàn!**
