#!/bin/bash

# EMERGENCY: Stop Memory Leak & Restart Safely
echo "🚨 EMERGENCY: Node.js Memory Leak - Immediate Fix"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}⚠️  STOPPING ALL NODE.JS PROCESSES${NC}"

# 1. Kill all Node.js processes immediately
echo "🔄 Killing all Node.js/Next.js processes..."
pkill -f "next" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true
sleep 3

# 2. Force memory cleanup
echo "🧹 Emergency memory cleanup..."
sync
echo 3 > /proc/sys/vm/drop_caches

# 3. Check memory after cleanup
echo ""
echo "📊 Memory after emergency cleanup:"
echo "Available: $(free -h | awk 'NR==2{print $7}')"
echo "Usage: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"

# 4. Wait for memory to stabilize
echo ""
echo "⏳ Waiting 10 seconds for memory to stabilize..."
sleep 10

# 5. Restart with strict memory limits
echo ""
echo -e "${GREEN}🚀 Restarting with STRICT memory limits...${NC}"
echo "Memory allocation: 1GB heap (25% of 4GB RAM)"

# Navigate to project directory
if [ -d "/home/ubuntu/online-course-platform" ]; then
    cd /home/ubuntu/online-course-platform
elif [ -d "/var/www/online-course-platform" ]; then
    cd /var/www/online-course-platform
else
    echo "❌ Cannot find project directory"
    echo "Current directory: $(pwd)"
    echo "Please navigate to your project directory and run:"
    echo "NODE_OPTIONS='--max-old-space-size=1024 --optimize-for-size --expose-gc' npm run start"
    exit 1
fi

echo "📁 Project directory: $(pwd)"

# 6. Start with memory constraints
echo "🚀 Starting with memory-safe configuration..."

# Export strict memory settings
export NODE_OPTIONS="--max-old-space-size=1024 --optimize-for-size --expose-gc --max-semi-space-size=32"

echo "Memory settings applied:"
echo "  Heap size: 1024MB (1GB)"
echo "  Optimized for size: Yes"
echo "  Garbage collection: Exposed"
echo "  Semi-space: 32MB (very conservative)"

# 7. Check if PM2 is available
if command -v pm2 &> /dev/null; then
    echo ""
    echo "📦 Using PM2 with memory restart limits..."
    
    # Stop any existing PM2 processes
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
    
    # Start with PM2 and auto-restart if memory > 1.5GB
    pm2 start npm --name "upload-app" --max-memory-restart 1536M -- run start:safe
    pm2 startup
    pm2 save
    
    echo "✅ Started with PM2 (auto-restart if memory > 1.5GB)"
    
else
    echo ""
    echo "🔄 Starting with npm (install PM2 recommended)..."
    npm run start:safe &
    
    echo "✅ Started with npm"
    echo "💡 Install PM2 for better process management:"
    echo "   npm install -g pm2"
fi

# 8. Monitor for 60 seconds
echo ""
echo "📊 Monitoring memory for 60 seconds..."
echo "Press Ctrl+C to stop monitoring"

for i in {1..12}; do
    sleep 5
    
    # Get current memory stats
    SYSTEM_MEM=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    AVAILABLE=$(free -h | awk 'NR==2{print $7}')
    
    # Check Node.js memory if running
    NODE_PID=$(pgrep -f "next" | head -1)
    if [ -n "$NODE_PID" ]; then
        NODE_MEM_MB=$(ps -p $NODE_PID -o rss --no-headers | tr -d ' ')
        NODE_MEM_MB=$((NODE_MEM_MB / 1024))
        
        if [ $NODE_MEM_MB -gt 1536 ]; then
            echo "🚨 WARNING: Node.js using ${NODE_MEM_MB}MB (> 1.5GB limit)"
        else
            echo "✅ Memory OK: System ${SYSTEM_MEM}% | Node.js ${NODE_MEM_MB}MB | Available ${AVAILABLE}"
        fi
    else
        echo "❌ Node.js not running"
        break
    fi
done

echo ""
echo -e "${GREEN}🎯 Emergency restart completed!${NC}"
echo ""
echo "📊 Final status:"
echo "System memory: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Available: $(free -h | awk 'NR==2{print $7}')"

NODE_PID=$(pgrep -f "next" | head -1)
if [ -n "$NODE_PID" ]; then
    NODE_MEM_MB=$(ps -p $NODE_PID -o rss --no-headers | tr -d ' ')
    NODE_MEM_MB=$((NODE_MEM_MB / 1024))
    echo "Node.js memory: ${NODE_MEM_MB}MB"
    echo "✅ Application is running with memory limits"
else
    echo "❌ Application failed to start"
fi

echo ""
echo -e "${YELLOW}💡 Monitoring commands:${NC}"
echo "watch -n 5 'free -h && ps aux | grep next | head -3'"
echo "sudo tail -f /var/log/nginx/error.log"
echo ""
echo -e "${YELLOW}🛠️  If memory issues persist:${NC}"
echo "1. Run: sudo bash fix-memory-leak.sh"
echo "2. Add swap file: sudo fallocate -l 2G /swapfile"
echo "3. Monitor with memory guard service"
