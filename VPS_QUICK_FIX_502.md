# 🚨 VPS Quick Fix - Lỗi 502 Upload Video 1GB

## ⚡ Fix Nhanh (5 Phút)

### **Bước 1: Setup Nginx (AUTO)**
```bash
# Download và chạy script tự động
curl -o vps-nginx-setup.sh https://raw.githubusercontent.com/your-repo/vps-nginx-setup.sh
sudo bash vps-nginx-setup.sh
```

### **Bước 2: Start App Tối Ưu**
```bash
# Khởi động server với memory tối ưu
bash start-vps-server.sh vps

# Hoặc manual:
npm run start:vps
```

### **Bước 3: Test Upload**
```bash
# Test ngay
curl -X POST -F "file=@test-video.mp4" http://your-vps-ip/api/upload-proxy
```

## 🔧 Manual Fix (Nếu Script Không Hoạt Động)

### **Fix Nginx Config**

**File: `/etc/nginx/sites-available/default`**
```nginx
server {
    listen 80;
    server_name _;
    
    # CRITICAL: Cấu hình cho file lớn
    client_max_body_size 5G;
    client_body_timeout 1800s;
    client_header_timeout 1800s;
    send_timeout 1800s;
    
    # CRITICAL: Location cho upload API
    location ~ ^/api/upload {
        proxy_pass http://localhost:3000;
        
        # Tắt buffering - QUAN TRỌNG!
        proxy_request_buffering off;
        proxy_buffering off;
        
        # Timeout lớn
        proxy_connect_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_read_timeout 1800s;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Commands:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### **Fix Node.js Memory**

**File: `package.json`**
```json
{
  "scripts": {
    "start": "NODE_OPTIONS='--max-old-space-size=1024 --expose-gc' next start"
  }
}
```

**Start App:**
```bash
npm run start
```

## 🚨 Instant Troubleshooting

### **Lỗi 502 Bad Gateway**
```bash
# 1. Kiểm tra Node.js
curl http://localhost:3000
ps aux | grep node

# 2. Restart nginx
sudo systemctl restart nginx

# 3. Check logs
sudo tail -10 /var/log/nginx/error.log
```

### **Lỗi 413 Request Entity Too Large**
```bash
# Fix nginx config
sudo grep -r "client_max_body_size" /etc/nginx/
# Phải có: client_max_body_size 5G;

sudo systemctl reload nginx
```

### **Lỗi 504 Gateway Timeout**
```bash
# Tăng timeout
sudo nano /etc/nginx/sites-available/default
# Thêm: proxy_read_timeout 1800s;

sudo systemctl reload nginx
```

### **Upload Bị Stuck**
```bash
# Check memory
free -h
htop

# Check disk
df -h

# Restart app
pm2 restart upload-app
```

## 📊 Quick Health Check

```bash
# All-in-one health check
echo "=== NGINX STATUS ==="
sudo systemctl status nginx

echo "=== NODE.JS PROCESS ==="
ps aux | grep node | grep -v grep

echo "=== MEMORY USAGE ==="
free -h

echo "=== DISK SPACE ==="
df -h .

echo "=== RECENT ERRORS ==="
sudo tail -5 /var/log/nginx/error.log
```

## ⚡ Performance Quick Test

```bash
# Test upload speed
time curl -X POST -F "file=@100mb-test.mp4" http://localhost/api/upload-proxy

# Expected results:
# 100MB: < 2 minutes
# 500MB: < 8 minutes  
# 1GB: < 15 minutes
```

## 🎯 Khắc Phục Theo Triệu Chứng

### **502 ngay lập tức**
- ✅ Node.js app chưa chạy
- ✅ Port 3000 không accessible
- ✅ Nginx config sai

### **502 sau một lúc upload**
- ✅ Nginx timeout quá ngắn
- ✅ Node.js memory overflow
- ✅ Disk space đầy

### **Upload chậm/stuck**
- ✅ Bandwidth VPS thấp
- ✅ Memory không đủ
- ✅ CPU overload

### **File upload thành công nhưng không save**
- ✅ Database connection issue
- ✅ S3 credentials sai
- ✅ File permissions

## 🚀 Optimization Commands

```bash
# Optimize VPS performance
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Monitor during upload
watch -n 1 'free -h && ps aux | grep node'

# Log upload activity
sudo tail -f /var/log/nginx/access.log | grep upload
```

## ✅ Success Indicators

Sau khi fix thành công:
- ✅ Upload 1GB video không 502
- ✅ Memory usage < 80%
- ✅ Progress bar hoạt động
- ✅ Logs không có error
- ✅ Server responsive sau upload

**🎉 1GB Upload Success! 🎬📤**
