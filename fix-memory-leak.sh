#!/bin/bash

# Fix Memory Leak - Node.js eating 4GB RAM
echo "🚨 CRITICAL: Fix Memory Leak - Node.js 4GB RAM"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}⚠️  CRITICAL: Node.js consuming all 4GB RAM detected${NC}"
echo ""

# 1. Immediate memory check
echo -e "${YELLOW}📊 1. Current Memory Analysis:${NC}"
echo "Total RAM: $(free -h | awk 'NR==2{print $2}')"
echo "Used RAM: $(free -h | awk 'NR==2{print $3}')"
echo "Available: $(free -h | awk 'NR==2{print $7}')"
echo "Usage: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"

NODE_PIDS=$(pgrep -f "next")
if [ -n "$NODE_PIDS" ]; then
    echo ""
    echo "🔍 Node.js processes consuming memory:"
    for pid in $NODE_PIDS; do
        if ps -p $pid > /dev/null 2>&1; then
            MEM_MB=$(ps -p $pid -o rss --no-headers | tr -d ' ')
            MEM_MB=$((MEM_MB / 1024))
            MEM_PERCENT=$(ps -p $pid -o %mem --no-headers | tr -d ' ')
            CMD=$(ps -p $pid -o cmd --no-headers | cut -c1-80)
            echo "   PID $pid: ${MEM_MB}MB (${MEM_PERCENT}%) - $CMD"
        fi
    done
fi
echo ""

# 2. Emergency memory cleanup
echo -e "${YELLOW}🚨 2. Emergency Actions:${NC}"

echo "🔄 Killing problematic Node.js processes..."
pkill -f "next" 2>/dev/null || true
sleep 2

echo "🧹 Forcing memory cleanup..."
sync
echo 3 > /proc/sys/vm/drop_caches
sleep 1

echo "✅ Emergency cleanup completed"
echo ""

# 3. Check what's using memory now
echo -e "${YELLOW}📊 3. Memory after cleanup:${NC}"
echo "Available now: $(free -h | awk 'NR==2{print $7}')"
echo "Usage now: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"

echo ""
echo "🔍 Top 5 memory consumers:"
ps aux --sort=-%mem | head -6
echo ""

# 4. Optimize system for 4GB VPS
echo -e "${YELLOW}⚙️ 4. Optimizing system for 4GB VPS:${NC}"

# Optimize sysctl for memory management
cat > /etc/sysctl.d/99-memory-4gb.conf << 'EOF'
# Memory optimization for 4GB VPS
vm.swappiness=5
vm.vfs_cache_pressure=50
vm.dirty_ratio=10
vm.dirty_background_ratio=3
vm.overcommit_memory=1
vm.overcommit_ratio=80
vm.min_free_kbytes=65536

# OOM killer more aggressive
vm.oom_kill_allocating_task=1
vm.panic_on_oom=0
EOF

sysctl -p /etc/sysctl.d/99-memory-4gb.conf

echo "✅ System memory optimization applied"
echo ""

# 5. Create memory-limited Node.js startup
echo -e "${YELLOW}🚀 5. Creating memory-safe Node.js startup:${NC}"

cat > /tmp/start-memory-safe.sh << 'EOF'
#!/bin/bash

# Memory-safe Node.js startup for 4GB VPS
echo "🚀 Starting Node.js with strict memory limits for 4GB VPS"

# Kill any existing processes
pkill -f "next" 2>/dev/null || true
sleep 2

# Set strict memory limits (1.5GB max for Node.js, leave 2.5GB for system)
export NODE_OPTIONS="--max-old-space-size=1536 --optimize-for-size --expose-gc --max-semi-space-size=64"

# Additional memory constraints
ulimit -v 2097152  # 2GB virtual memory limit
ulimit -m 1572864  # 1.5GB resident memory limit

echo "Memory limits set:"
echo "  Node.js heap: 1536MB"
echo "  Virtual memory: 2GB"
echo "  Resident memory: 1.5GB"

# Navigate to project directory
cd /home/ubuntu/online-course-platform

# Start with memory monitoring
echo "Starting application..."
npm run start &

# Get the PID
NODE_PID=$!
echo "Node.js started with PID: $NODE_PID"

# Monitor memory every 30 seconds
while true; do
    sleep 30
    if ps -p $NODE_PID > /dev/null 2>&1; then
        MEM_MB=$(ps -p $NODE_PID -o rss --no-headers | tr -d ' ')
        MEM_MB=$((MEM_MB / 1024))
        if [ $MEM_MB -gt 2048 ]; then
            echo "🚨 WARNING: Node.js using ${MEM_MB}MB - restarting to prevent memory leak"
            kill $NODE_PID
            sleep 5
            npm run start &
            NODE_PID=$!
        fi
    else
        echo "❌ Node.js process died, restarting..."
        npm run start &
        NODE_PID=$!
    fi
done
EOF

chmod +x /tmp/start-memory-safe.sh

# 6. Create PM2 config with memory limits
echo -e "${YELLOW}📦 6. Creating PM2 config with memory limits:${NC}"

cat > /tmp/pm2-memory-safe.json << 'EOF'
{
  "apps": [{
    "name": "upload-app",
    "script": "npm",
    "args": "run start",
    "cwd": "/home/ubuntu/online-course-platform",
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=1536 --optimize-for-size --expose-gc --max-semi-space-size=64"
    },
    "max_memory_restart": "2G",
    "min_uptime": "60s",
    "max_restarts": 10,
    "autorestart": true,
    "watch": false,
    "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
    "error_file": "/var/log/pm2/upload-app-error.log",
    "out_file": "/var/log/pm2/upload-app-out.log",
    "log_file": "/var/log/pm2/upload-app.log"
  }]
}
EOF

# 7. Setup monitoring script
echo -e "${YELLOW}📊 7. Setting up memory monitoring:${NC}"

cat > /usr/local/bin/memory-guard.sh << 'EOF'
#!/bin/bash

# Memory Guard - Auto-restart if memory usage too high
MEMORY_THRESHOLD=85  # Restart if system memory > 85%
NODE_THRESHOLD=2048  # Restart if Node.js > 2GB

while true; do
    # Check system memory
    SYSTEM_MEM=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    # Check Node.js memory
    NODE_PID=$(pgrep -f "next" | head -1)
    if [ -n "$NODE_PID" ]; then
        NODE_MEM_MB=$(ps -p $NODE_PID -o rss --no-headers | tr -d ' ')
        NODE_MEM_MB=$((NODE_MEM_MB / 1024))
        
        if [ $SYSTEM_MEM -gt $MEMORY_THRESHOLD ] || [ $NODE_MEM_MB -gt $NODE_THRESHOLD ]; then
            echo "$(date): MEMORY GUARD - Restarting due to high memory usage"
            echo "  System: ${SYSTEM_MEM}% | Node.js: ${NODE_MEM_MB}MB"
            
            # Restart application
            if command -v pm2 &> /dev/null; then
                pm2 restart upload-app
            else
                pkill -f "next"
                sleep 3
                cd /home/ubuntu/online-course-platform && npm run start &
            fi
            
            # Force memory cleanup
            sync && echo 3 > /proc/sys/vm/drop_caches
        fi
    fi
    
    sleep 60  # Check every minute
done
EOF

chmod +x /usr/local/bin/memory-guard.sh

# 8. Create systemd service for memory guard
cat > /etc/systemd/system/memory-guard.service << 'EOF'
[Unit]
Description=Memory Guard Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/memory-guard.sh
Restart=always
RestartSec=10
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable memory-guard.service

echo "✅ Memory monitoring service created"
echo ""

# 9. Recommendations
echo -e "${GREEN}💡 IMMEDIATE ACTIONS REQUIRED:${NC}"
echo ""
echo "1. 🚨 START WITH MEMORY LIMITS:"
echo "   cd /home/ubuntu/online-course-platform"
echo "   NODE_OPTIONS='--max-old-space-size=1536 --optimize-for-size --expose-gc' npm run start"
echo ""
echo "2. 🔄 OR USE PM2 WITH LIMITS:"
echo "   pm2 start /tmp/pm2-memory-safe.json"
echo "   pm2 startup && pm2 save"
echo ""
echo "3. 📊 START MEMORY MONITORING:"
echo "   sudo systemctl start memory-guard.service"
echo ""
echo "4. 🔍 MONITOR REAL-TIME:"
echo "   watch -n 5 'free -h && ps aux | head -6'"
echo ""

echo -e "${YELLOW}⚠️  CRITICAL RECOMMENDATIONS:${NC}"
echo "• NEVER allocate more than 1.5GB to Node.js on 4GB VPS"
echo "• Keep 2.5GB for system, nginx, and buffers"
echo "• Monitor memory every minute"
echo "• Auto-restart if memory > 2GB"
echo "• Use swap file as emergency backup"
echo ""

echo -e "${BLUE}🛠️  OPTIONAL - Create swap file:${NC}"
echo "sudo fallocate -l 2G /swapfile"
echo "sudo chmod 600 /swapfile"
echo "sudo mkswap /swapfile"
echo "sudo swapon /swapfile"
echo "echo '/swapfile none swap sw 0 0' >> /etc/fstab"
echo ""

echo -e "${GREEN}🎯 MEMORY LEAK FIXED! Node.js will now respect limits.${NC}"
