# 🚀 VPS + Nginx: Giải Pháp Upload Video 1GB+ Không Bị 502

## 🎯 Vấn Đề Bạn Đang Gặp

**Hiện tượng:** Upload video 1GB trên VPS + nginx → Lỗi 502 → Server vẫn hoạt động bình thường sau đó

**Nguyên nhân:** Nginx timeout và cấu hình không phù hợp với file lớn

## ⚡ Giải Pháp Nhanh (Auto Setup)

### **1. Chạy Script Tự Động (KHUYẾN NGHỊ)**
```bash
# Download và chạy script setup
sudo bash vps-nginx-setup.sh
```

Script sẽ tự động:
- ✅ Cấu hình nginx cho file 5GB
- ✅ Set timeout 30 phút  
- ✅ Tắt buffering cho streaming
- ✅ Tạo logs monitoring
- ✅ Restart nginx

### **2. Kiểm Tra Kết Quả**
```bash
# Kiểm tra nginx status
sudo systemctl status nginx

# Test upload ngay
# Truy cập: http://YOUR-VPS-IP/admin
```

## 🔧 Giải Pháp Manual (Nếu Muốn Tự Setup)

### **Bước 1: Cấu Hình Nginx**

Sửa file `/etc/nginx/nginx.conf`:
```nginx
http {
    # Tăng giới hạn file lên 5GB
    client_max_body_size 5G;
    
    # Tăng timeout lên 30 phút
    client_body_timeout 1800s;
    client_header_timeout 1800s;
    keepalive_timeout 1800s;
    send_timeout 1800s;
    
    # Buffer cho file lớn
    client_body_buffer_size 1M;
    large_client_header_buffers 8 16k;
}
```

### **Bước 2: Cấu Hình Site**

Tạo file `/etc/nginx/sites-available/your-site`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # CRITICAL: Cấu hình cho upload API
    location ~ ^/api/(upload|admin) {
        proxy_pass http://localhost:3000;
        
        # Tắt buffering - QUAN TRỌNG!
        proxy_request_buffering off;
        proxy_buffering off;
        
        # Timeout cho upload lớn
        proxy_connect_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_read_timeout 1800s;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # File upload headers
        proxy_set_header Content-Length $content_length;
        proxy_set_header Content-Type $content_type;
    }
    
    # Location cho admin pages
    location /admin {
        proxy_pass http://localhost:3000;
        proxy_connect_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_read_timeout 1800s;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Default location
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **Bước 3: Enable và Restart**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## 🛡️ Cấu Hình Node.js App

### **Bước 1: Tối Ưu Memory**

Cập nhật `package.json`:
```json
{
  "scripts": {
    "start": "NODE_OPTIONS='--max-old-space-size=1024' next start",
    "dev": "NODE_OPTIONS='--max-old-space-size=512' next dev"
  }
}
```

### **Bước 2: Khởi Động App**
```bash
# Production mode
npm run build
npm start

# hoặc PM2 (khuyến nghị)
pm2 start npm --name "upload-app" -- start
pm2 startup
pm2 save
```

## 📊 Monitoring & Debugging

### **1. Monitor Real-time**
```bash
# Script monitoring tự động
sudo /usr/local/bin/monitor-upload.sh

# Manual monitoring
watch -n 1 'free -h && ps aux | grep node'
```

### **2. Check Logs**
```bash
# Nginx upload logs
sudo tail -f /var/log/nginx/upload_access.log

# Nginx error logs  
sudo tail -f /var/log/nginx/upload_error.log

# Node.js logs (nếu dùng PM2)
pm2 logs upload-app
```

### **3. Debug Upload Issues**
```bash
# Test file upload bằng curl
curl -X POST -F "file=@test-video.mp4" http://your-vps-ip/api/upload-proxy

# Kiểm tra nginx config
sudo nginx -t

# Reload nginx không downtime
sudo nginx -s reload
```

## 🚨 Troubleshooting Các Lỗi Thường Gặp

### **Lỗi 502 Bad Gateway**
```bash
# 1. Kiểm tra Node.js app có chạy không
curl http://localhost:3000

# 2. Kiểm tra nginx config
sudo nginx -t

# 3. Xem error logs
sudo tail -20 /var/log/nginx/error.log

# 4. Restart services
sudo systemctl restart nginx
pm2 restart upload-app
```

### **Lỗi 413 Request Entity Too Large**
```bash
# Kiểm tra client_max_body_size trong nginx.conf
sudo grep -r "client_max_body_size" /etc/nginx/

# Phải có: client_max_body_size 5G;
```

### **Lỗi 504 Gateway Timeout**
```bash
# Tăng timeout trong site config
# proxy_read_timeout 1800s;
# proxy_send_timeout 1800s;

sudo systemctl reload nginx
```

### **Upload Bị Stuck/Chậm**
```bash
# 1. Kiểm tra memory usage
free -h
htop

# 2. Kiểm tra disk space
df -h

# 3. Monitor network
iftop  # hoặc nethogs
```

## 🎯 Performance Optimization

### **1. VPS Resource**
```bash
# Minimum requirements
- RAM: 1GB (2GB khuyến nghị)
- CPU: 1 core
- Disk: SSD preferred
- Bandwidth: Unlimited hoặc cao
```

### **2. Nginx Tuning**
```nginx
# Worker processes
worker_processes auto;

# Worker connections
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

# Keep-alive
keepalive_timeout 1800;
keepalive_requests 100;
```

### **3. Node.js Tuning**
```bash
# Tăng file descriptor limit
ulimit -n 65536

# Optimize Node.js
NODE_OPTIONS='--max-old-space-size=1024 --optimize-for-size'
```

## 📈 Test Upload Performance

### **1. Test File Sizes**
- ✅ 100MB: Phải upload < 2 phút
- ✅ 500MB: Phải upload < 8 phút  
- ✅ 1GB: Phải upload < 15 phút
- ✅ 2GB: Phải upload < 30 phút

### **2. Benchmark Commands**
```bash
# Test speed với curl
time curl -X POST -F "file=@1gb-video.mp4" http://your-vps/api/upload-proxy

# Monitor trong khi upload
watch -n 1 'ps aux | grep node && free -h'
```

## 🎉 Kết Quả Mong Đợi

Sau khi setup đúng:
- ✅ **Upload 1GB video**: Thành công trong 10-15 phút
- ✅ **No 502 errors**: Không còn timeout
- ✅ **Stable server**: Memory usage ổn định < 80%
- ✅ **Real-time progress**: Progress bar hoạt động
- ✅ **Multiple uploads**: Có thể upload nhiều file

## 🚀 Quick Commands Summary

```bash
# Setup nhanh
sudo bash vps-nginx-setup.sh

# Start app  
npm start

# Monitor
sudo /usr/local/bin/monitor-upload.sh

# Test upload
curl -X POST -F "file=@video.mp4" http://your-vps/api/upload-proxy

# Debug
sudo tail -f /var/log/nginx/upload_error.log
```

**🎬 Happy Large File Uploading trên VPS! 📤**
