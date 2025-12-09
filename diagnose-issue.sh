#!/bin/bash

echo "🔍 DIAGNOSE UPLOAD ISSUE - VPS 4GB RAM"
echo "======================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m' 
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🖥️  SYSTEM STATUS CHECK"
echo "----------------------"

# 1. Memory Status
print_status "1. Memory Usage:"
free -h
echo

# 2. Check Node.js processes
print_status "2. Node.js Processes:"
ps aux | grep -E "(node|next)" | grep -v grep
echo

# 3. Memory usage by process
print_status "3. Top Memory Users:"
ps aux --sort=-%mem | head -10
echo

# 4. System Load
print_status "4. System Load:"
uptime
echo

# 5. Disk Usage
print_status "5. Disk Usage:"
df -h | head -5
echo

echo "🔧 APPLICATION STATUS CHECK"
echo "----------------------------"

# 6. Check if Next.js is running
print_status "6. Next.js Application Status:"
if pgrep -f "next" > /dev/null; then
    print_success "Next.js is running"
    
    # Get PID and memory
    NEXT_PID=$(pgrep -f "next")
    NEXT_MEM=$(ps -o pid,vsz,rss,comm --pid $NEXT_PID | tail -1)
    echo "   Process Info: $NEXT_MEM"
    
    # Calculate memory in MB
    RSS_KB=$(echo $NEXT_MEM | awk '{print $3}')
    RSS_MB=$((RSS_KB / 1024))
    echo "   Memory Usage: ${RSS_MB}MB"
    
    if [ $RSS_MB -gt 1500 ]; then
        print_error "❌ MEMORY LEAK DETECTED: Next.js using ${RSS_MB}MB (should be < 1500MB)"
        MEMORY_ISSUE=true
    else
        print_success "✅ Memory usage is normal: ${RSS_MB}MB"
        MEMORY_ISSUE=false
    fi
else
    print_error "❌ Next.js is NOT running"
    APP_NOT_RUNNING=true
fi
echo

# 7. Check PM2 status
print_status "7. PM2 Status:"
if command -v pm2 > /dev/null; then
    pm2 status 2>/dev/null || echo "No PM2 processes"
else
    echo "PM2 not installed"
fi
echo

# 8. Check ports
print_status "8. Port 3000 Status:"
if netstat -tlnp 2>/dev/null | grep :3000 > /dev/null; then
    print_success "✅ Port 3000 is open"
    netstat -tlnp | grep :3000
else
    print_error "❌ Port 3000 is not listening"
    PORT_ISSUE=true
fi
echo

echo "🌐 NGINX STATUS CHECK"
echo "---------------------"

# 9. Nginx status
print_status "9. Nginx Service:"
if systemctl is-active --quiet nginx; then
    print_success "✅ Nginx is running"
else
    print_error "❌ Nginx is not running"
    NGINX_ISSUE=true
fi

# 10. Test nginx config
print_status "10. Nginx Config Test:"
if nginx -t 2>/dev/null; then
    print_success "✅ Nginx config is valid"
else
    print_error "❌ Nginx config has errors"
    nginx -t
    NGINX_CONFIG_ISSUE=true
fi
echo

# 11. Check nginx error logs (last 10 lines)
print_status "11. Recent Nginx Errors:"
if [ -f /var/log/nginx/error.log ]; then
    tail -10 /var/log/nginx/error.log | grep -E "(error|crit|alert|emerg)" || echo "No recent errors"
else
    echo "Error log not found"
fi
echo

echo "🔗 CONNECTIVITY TESTS"
echo "----------------------"

# 12. Test localhost connection
print_status "12. Local App Connection:"
if curl -s http://localhost:3000 > /dev/null; then
    print_success "✅ Local app responds"
else
    print_error "❌ Local app not responding"
    LOCAL_CONN_ISSUE=true
fi

# 13. Test upload API
print_status "13. Upload API Test:"
API_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/upload-proxy -o /dev/null 2>/dev/null)
if [ "$API_RESPONSE" = "400" ] || [ "$API_RESPONSE" = "200" ]; then
    print_success "✅ Upload API responds (code: $API_RESPONSE)"
else
    print_error "❌ Upload API not responding (code: $API_RESPONSE)"
    API_ISSUE=true
fi
echo

echo "📁 FILE SYSTEM CHECK"
echo "---------------------"

# 14. Check important files exist
print_status "14. Critical Files:"
FILES_TO_CHECK=(
    "package.json"
    ".env.local"
    "app/api/upload-proxy/route.ts"
    "lib/s3-longvan.ts"
    "emergency-restart.sh"
    "fix-memory-leak.sh"
    "nginx-fix-502.conf"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file exists"
    else
        print_error "❌ $file missing"
        MISSING_FILES=true
    fi
done
echo

# 15. Check environment variables
print_status "15. Environment Variables:"
if [ -f ".env.local" ]; then
    if grep -q "AWS_ACCESS_KEY_ID" .env.local && grep -q "AWS_SECRET_ACCESS_KEY" .env.local; then
        print_success "✅ AWS credentials configured"
    else
        print_error "❌ AWS credentials missing in .env.local"
        ENV_ISSUE=true
    fi
else
    print_error "❌ .env.local file missing"
    ENV_ISSUE=true
fi
echo

echo "🎯 DIAGNOSIS SUMMARY"
echo "====================="

# Determine main issues
ISSUES_FOUND=false

if [ "$MEMORY_ISSUE" = true ]; then
    print_error "🚨 CRITICAL: Memory leak detected - Node.js using too much RAM"
    echo "   Fix: Run 'bash emergency-restart.sh'"
    ISSUES_FOUND=true
fi

if [ "$APP_NOT_RUNNING" = true ]; then
    print_error "🚨 CRITICAL: Next.js application not running"
    echo "   Fix: Run 'npm run start:safe' or 'pm2 start'"
    ISSUES_FOUND=true
fi

if [ "$PORT_ISSUE" = true ]; then
    print_error "🚨 CRITICAL: Port 3000 not listening"
    echo "   Fix: Start the application or check port conflicts"
    ISSUES_FOUND=true
fi

if [ "$NGINX_ISSUE" = true ]; then
    print_error "🚨 CRITICAL: Nginx not running"
    echo "   Fix: Run 'sudo systemctl start nginx'"
    ISSUES_FOUND=true
fi

if [ "$NGINX_CONFIG_ISSUE" = true ]; then
    print_error "🚨 CRITICAL: Nginx configuration error"
    echo "   Fix: Run 'sudo bash fix-502-now.sh'"
    ISSUES_FOUND=true
fi

if [ "$LOCAL_CONN_ISSUE" = true ]; then
    print_error "🚨 CRITICAL: Local connection failed"
    echo "   Fix: Check application logs and restart"
    ISSUES_FOUND=true
fi

if [ "$API_ISSUE" = true ]; then
    print_error "🚨 CRITICAL: Upload API not responding"
    echo "   Fix: Check application logs and API routes"
    ISSUES_FOUND=true
fi

if [ "$ENV_ISSUE" = true ]; then
    print_error "⚠️  WARNING: Environment variables not configured"
    echo "   Fix: Create .env.local with AWS credentials"
    ISSUES_FOUND=true
fi

if [ "$MISSING_FILES" = true ]; then
    print_error "⚠️  WARNING: Some critical files are missing"
    echo "   Fix: Re-upload the complete codebase"
    ISSUES_FOUND=true
fi

echo
if [ "$ISSUES_FOUND" = false ]; then
    print_success "🎉 No critical issues found! System appears healthy."
    echo
    echo "📋 RECOMMENDED NEXT STEPS:"
    echo "1. Test a small file upload"
    echo "2. Test a large file upload (1GB+)"
    echo "3. Monitor memory during upload: watch -n 5 'free -h'"
else
    echo
    echo "🛠️  RECOMMENDED FIX ORDER:"
    echo "1. Fix memory leak: bash emergency-restart.sh"
    echo "2. Fix nginx config: sudo bash fix-502-now.sh"
    echo "3. Start application: npm run start:safe"
    echo "4. Test upload: curl -X POST -F 'file=@test.mp4' http://localhost:3000/api/upload-proxy"
fi

echo
echo "📊 CURRENT SYSTEM RESOURCES:"
echo "Memory: $(free -h | grep Mem | awk '{print $3"/"$2" ("$3/$2*100"%)"}' | bc -l 2>/dev/null || free -h | grep Mem)"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $5}')"

echo
echo "💡 TIP: Chạy script này thường xuyên để monitor hệ thống:"
echo "   watch -n 30 'bash diagnose-issue.sh'"
