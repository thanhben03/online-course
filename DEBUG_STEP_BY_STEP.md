# 🔍 DEBUG STEP BY STEP - Fix Upload Issue

## ⚡ Quick Diagnosis Commands

Chạy các commands này **trên server** để tìm ra vấn đề:

### **1. Check System Status**
```bash
# Check memory và processes
free -h
ps aux | grep -E "(node|next)" | head -5

# Check nếu có memory leak
ps aux --sort=-%mem | head -5
```

### **2. Check Application Status**  
```bash
# Check Next.js có chạy không
pgrep -f "next" && echo "✅ Next.js running" || echo "❌ Next.js NOT running"

# Check port 3000
netstat -tlnp | grep :3000 || echo "❌ Port 3000 not listening"

# Test local connection
curl -I http://localhost:3000 2>/dev/null && echo "✅ App responds" || echo "❌ App not responding"
```

### **3. Check Nginx Status**
```bash
# Check nginx service
sudo systemctl status nginx | head -10

# Test nginx config
sudo nginx -t

# Check nginx logs
sudo tail -20 /var/log/nginx/error.log
```

## 🎯 Common Issues & Fixes

### **Issue 1: Memory Leak (Node.js ăn 4GB)**
**Symptoms:**
```bash
ps aux | grep next
# Thấy Node.js process > 2GB RAM
```

**Fix:**
```bash
# Emergency restart với memory limits
sudo pkill -f "next"
NODE_OPTIONS='--max-old-space-size=1024 --expose-gc' npm run start:safe &

# Hoặc dùng script
bash emergency-restart.sh
```

### **Issue 2: Application Not Running**
**Symptoms:**
```bash
curl http://localhost:3000
# Connection refused
```

**Fix:**
```bash
# Check lỗi
npm run start:safe

# Hoặc với PM2
pm2 start npm --name "app" -- run start:safe
pm2 logs app
```

### **Issue 3: Nginx 502 Bad Gateway**
**Symptoms:**
```bash
curl https://yourdomain.com/api/upload-proxy
# 502 Bad Gateway
```

**Fix:**
```bash
# Apply nginx fix
sudo bash fix-502-now.sh

# Hoặc manual
sudo cp nginx-fix-502.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx
```

### **Issue 4: Environment Variables Missing**
**Symptoms:**
```bash
curl -X POST http://localhost:3000/api/upload-proxy
# AWS credentials not configured
```

**Fix:**
```bash
# Tạo .env.local
cat > .env.local << EOF
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here  
AWS_S3_BUCKET=your_bucket_name
EOF
```

### **Issue 5: Dependencies Not Installed**
**Symptoms:**
```bash
npm run start:safe
# Module not found errors
```

**Fix:**
```bash
# Install with memory limits
NODE_OPTIONS='--max-old-space-size=1024' npm install

# Clear cache nếu cần
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🛠️ Complete Diagnosis Script

Chạy script này để check toàn bộ:

```bash
# Download và chạy
chmod +x diagnose-issue.sh
bash diagnose-issue.sh
```

## 📋 Troubleshooting Checklist

**Trước khi báo lỗi, check những điều này:**

- [ ] **Memory**: Node.js < 1.5GB RAM (không phải 4GB)
- [ ] **Process**: `pgrep -f "next"` có kết quả
- [ ] **Port**: `netstat -tlnp | grep :3000` có kết quả  
- [ ] **Local**: `curl http://localhost:3000` returns HTML
- [ ] **API**: `curl -X POST http://localhost:3000/api/upload-proxy` returns error message (not connection refused)
- [ ] **Nginx**: `sudo systemctl status nginx` active
- [ ] **Config**: `sudo nginx -t` successful
- [ ] **Environment**: `.env.local` exists with AWS keys

## 🚀 Quick Fix All Issues

Nếu không muốn debug từng bước, chạy sequence này:

```bash
# 1. Stop everything
sudo pkill -f "next" 2>/dev/null
pm2 delete all 2>/dev/null

# 2. Fix memory leak
bash emergency-restart.sh

# 3. Fix nginx
sudo bash fix-502-now.sh  

# 4. Start with monitoring
watch -n 5 'free -h && ps aux | grep next | head -2'
```

## 💡 How to Report Issue

Nếu vẫn không fix được, gửi output của:

```bash
# Basic info
echo "=== SYSTEM ==="
free -h
ps aux | grep next | head -3

echo "=== APPLICATION ==="  
curl -I http://localhost:3000 2>&1
curl -X POST http://localhost:3000/api/upload-proxy 2>&1

echo "=== NGINX ==="
sudo systemctl status nginx | head -5
sudo tail -5 /var/log/nginx/error.log

echo "=== ENVIRONMENT ==="
ls -la .env*
npm --version
node --version
```

**Kết quả sẽ cho biết chính xác vấn đề nằm ở đâu! 🎯**
