#!/bin/bash

# Debug Upload Issue - Quick Check
echo "🔍 VPS 4GB RAM - Quick Upload Debug"
echo "==================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📅 Time: $(date)"
echo "💻 System: $(nproc) cores, $(free -h | awk 'NR==2{print $2}') RAM"
echo ""

# 1. Check Node.js process
echo -e "${YELLOW}⚡ Node.js Status:${NC}"
NODE_PID=$(pgrep -f "next")
if [ -n "$NODE_PID" ]; then
    echo "✅ Node.js running (PID: $NODE_PID)"
    NODE_MEM=$(ps -p $NODE_PID -o %mem --no-headers | xargs)
    echo "📊 Memory usage: ${NODE_MEM}%"
    
    # Test API
    if curl -s http://localhost:3000/api/upload-proxy > /dev/null; then
        echo "✅ Upload API responding"
    else
        echo "❌ Upload API not responding"
    fi
else
    echo "❌ Node.js not running"
    echo "💡 Start with: npm run start:4gb"
fi
echo ""

# 2. Check Nginx
echo -e "${YELLOW}🌐 Nginx Status:${NC}"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx running"
    
    # Check config
    if nginx -t 2>/dev/null; then
        echo "✅ Nginx config OK"
    else
        echo "❌ Nginx config error"
    fi
    
    # Check upload settings
    MAX_SIZE=$(nginx -T 2>/dev/null | grep -i "client_max_body_size" | head -1 | awk '{print $2}' | tr -d ';')
    echo "📋 Upload limit: ${MAX_SIZE:-"1m (default - NEED FIX)"}"
    
else
    echo "❌ Nginx not running"
    echo "💡 Start with: sudo systemctl start nginx"
fi
echo ""

# 3. Check recent errors
echo -e "${YELLOW}🔥 Recent Issues:${NC}"
if [ -f "/var/log/nginx/error.log" ]; then
    RECENT_ERRORS=$(tail -5 /var/log/nginx/error.log | grep -E "(error|warn|alert)" | wc -l)
    if [ "$RECENT_ERRORS" -gt 0 ]; then
        echo "⚠️  $RECENT_ERRORS recent nginx errors:"
        tail -3 /var/log/nginx/error.log | grep -E "(error|warn)" | sed 's/^/   /'
    else
        echo "✅ No recent nginx errors"
    fi
else
    echo "ℹ️  No nginx error log found"
fi
echo ""

# 4. Memory check
echo -e "${YELLOW}🧠 Memory Status:${NC}"
RAM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
RAM_AVAIL=$(free -h | awk 'NR==2{print $7}')

if [ "$RAM_USAGE" -gt 90 ]; then
    echo "🔴 Memory critical: ${RAM_USAGE}% used, $RAM_AVAIL available"
elif [ "$RAM_USAGE" -gt 80 ]; then
    echo "🟡 Memory high: ${RAM_USAGE}% used, $RAM_AVAIL available"
else
    echo "✅ Memory OK: ${RAM_USAGE}% used, $RAM_AVAIL available"
fi
echo ""

# 5. Quick fixes
echo -e "${YELLOW}🛠️  Quick Fixes:${NC}"

if [ -z "$NODE_PID" ]; then
    echo "1. Start Node.js: npm run start:4gb"
fi

if ! systemctl is-active --quiet nginx; then
    echo "2. Start Nginx: sudo systemctl start nginx"
fi

if [[ "$MAX_SIZE" =~ ^[0-9]+[mM]$ ]] || [ -z "$MAX_SIZE" ]; then
    echo "3. Fix Nginx config for large uploads:"
    echo "   sudo nano /etc/nginx/sites-available/default"
    echo "   Add: client_max_body_size 10G;"
    echo "   sudo systemctl reload nginx"
fi

if [ "$RAM_USAGE" -gt 85 ]; then
    echo "4. Free memory: sudo sync && sudo sysctl vm.drop_caches=3"
fi

echo ""
echo -e "${YELLOW}📊 Test Commands:${NC}"
echo "• Test API: curl -X POST http://localhost:3000/api/upload-proxy"
echo "• Monitor: watch -n 1 'free -h && ps aux | grep node'"
echo "• Logs: sudo tail -f /var/log/nginx/error.log"
echo ""

# Current recommendation
echo -e "${GREEN}💡 For VPS 4GB RAM:${NC}"
echo "1. Use: npm run start:4gb (2GB heap)"
echo "2. Set nginx client_max_body_size 10G"
echo "3. Monitor memory during upload"
echo "4. Upload should work for files up to 5GB"
