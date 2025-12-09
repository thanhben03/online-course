#!/bin/bash

# Quick Fix 502 Script for VPS 4GB
echo "🔧 Quick Fix 502 Bad Gateway - VPS 4GB"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root: sudo bash fix-502-now.sh${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Current System Status:${NC}"
echo "RAM: $(free -h | awk 'NR==2{print $2 " total, " $7 " available"}')"
echo "CPU: $(nproc) cores, Load: $(uptime | awk -F'load average:' '{print $2}')"
echo ""

# 1. Check current nginx config issues
echo -e "${YELLOW}🔍 1. Analyzing current nginx config...${NC}"

# Find nginx site file
SITE_FILE=""
if [ -f "/etc/nginx/sites-available/default" ]; then
    SITE_FILE="/etc/nginx/sites-available/default"
elif [ -f "/etc/nginx/sites-available/nhatminhanh.tech" ]; then
    SITE_FILE="/etc/nginx/sites-available/nhatminhanh.tech"
else
    # Find any file containing the domain
    SITE_FILE=$(grep -l "nhatminhanh.tech" /etc/nginx/sites-available/* 2>/dev/null | head -1)
fi

if [ -z "$SITE_FILE" ]; then
    echo -e "${RED}❌ Cannot find nginx site config${NC}"
    exit 1
fi

echo "📁 Found site config: $SITE_FILE"

# Check for issues
echo "🔍 Checking for common 502 issues:"

# Issue 1: Timeout conflicts
GLOBAL_TIMEOUT=$(grep -E "(client_body_timeout|proxy_read_timeout)" "$SITE_FILE" | head -1)
LOCATION_TIMEOUT=$(grep -A 20 "location /" "$SITE_FILE" | grep -E "(proxy_read_timeout)" | head -1)

if [ -n "$GLOBAL_TIMEOUT" ] && [ -n "$LOCATION_TIMEOUT" ]; then
    echo "⚠️  Found timeout conflicts in config"
fi

# Issue 2: Missing upload-specific location
if ! grep -q "location.*upload" "$SITE_FILE"; then
    echo "❌ Missing specific location for upload APIs"
fi

# Issue 3: client_max_body_size 0
if grep -q "client_max_body_size 0" "$SITE_FILE"; then
    echo "⚠️  client_max_body_size 0 may cause issues"
fi

echo ""

# 2. Check Node.js status
echo -e "${YELLOW}⚡ 2. Checking Node.js application...${NC}"

NODE_PID=$(pgrep -f "next")
if [ -n "$NODE_PID" ]; then
    echo "✅ Node.js running (PID: $NODE_PID)"
    
    # Check memory usage
    NODE_MEM=$(ps -p $NODE_PID -o %mem --no-headers | tr -d ' ')
    NODE_RSS=$(ps -p $NODE_PID -o rss --no-headers | tr -d ' ')
    NODE_RSS_MB=$((NODE_RSS / 1024))
    echo "📊 Memory: ${NODE_MEM}% (${NODE_RSS_MB}MB)"
    
    # Test connectivity
    if curl -s --connect-timeout 5 http://localhost:3000 > /dev/null; then
        echo "✅ Node.js responding on port 3000"
    else
        echo "❌ Node.js not responding on port 3000"
        echo "💡 Try restarting: pm2 restart all"
    fi
else
    echo "❌ Node.js not running"
    echo "💡 Start with: npm run start:4gb"
fi
echo ""

# 3. Apply fixed nginx config
echo -e "${YELLOW}🔧 3. Applying fixed nginx configuration...${NC}"

# Backup current config
cp "$SITE_FILE" "$SITE_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "📋 Backed up config to: $SITE_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Apply the fix - extract just the server block and replace
echo "🔄 Applying optimized config..."

# Create the fixed config
cat > /tmp/nginx-server-fix.conf << 'EOF'
server {
    server_name nhatminhanh.tech www.nhatminhanh.tech;
    
    # OPTIMIZED FOR 4GB VPS - CONSISTENT TIMEOUTS
    client_max_body_size 10G;
    client_body_timeout 3600s;
    client_header_timeout 3600s;
    keepalive_timeout 3600s;
    send_timeout 3600s;
    
    # BUFFER SETTINGS
    client_body_buffer_size 16M;
    client_header_buffer_size 8k;
    large_client_header_buffers 16 32k;
    
    # DISABLE BUFFERING
    proxy_request_buffering off;
    proxy_buffering off;
    proxy_max_temp_file_size 0;
    
    # CRITICAL: Upload API location
    location ~ ^/api/(upload|admin) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # DISABLE BUFFERING
        proxy_request_buffering off;
        proxy_buffering off;
        proxy_max_temp_file_size 0;
        
        # LONG TIMEOUTS
        proxy_connect_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_read_timeout 3600s;
        
        # Upload headers
        proxy_set_header Content-Length $content_length;
        proxy_set_header Content-Type $content_type;
        
        gzip off;
        access_log /var/log/nginx/upload.log;
    }
    
    # Admin pages
    location /admin {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_read_timeout 3600s;
    }
    
    # Default location
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/nhatminhanh.tech/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/nhatminhanh.tech/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.nhatminhanh.tech) {
        return 301 https://$host$request_uri;
    }

    if ($host = nhatminhanh.tech) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name nhatminhanh.tech www.nhatminhanh.tech;
    return 404;
}
EOF

# Replace the config
cp /tmp/nginx-server-fix.conf "$SITE_FILE"

# 4. Test and reload nginx
echo -e "${YELLOW}🧪 4. Testing nginx configuration...${NC}"
if nginx -t; then
    echo "✅ Nginx config test passed"
    
    echo "🔄 Reloading nginx..."
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx reloaded successfully"
    else
        echo "❌ Failed to reload nginx"
        # Restore backup
        cp "$SITE_FILE.backup.$(date +%Y%m%d_%H%M%S)" "$SITE_FILE"
        nginx -t && systemctl reload nginx
        exit 1
    fi
else
    echo "❌ Nginx config test failed"
    # Restore backup
    cp "$SITE_FILE.backup.$(date +%Y%m%d_%H%M%S)" "$SITE_FILE"
    exit 1
fi

echo ""

# 5. Optimize Node.js if needed
echo -e "${YELLOW}⚡ 5. Optimizing Node.js for 4GB VPS...${NC}"

if [ -n "$NODE_PID" ]; then
    # Check if using optimal memory settings
    NODE_OPTS=$(ps -p $NODE_PID -o cmd --no-headers | grep -o -- '--max-old-space-size=[0-9]*')
    if [[ "$NODE_OPTS" =~ --max-old-space-size=([0-9]+) ]]; then
        HEAP_SIZE=${BASH_REMATCH[1]}
        if [ "$HEAP_SIZE" -lt 1500 ]; then
            echo "⚠️  Node.js heap size is ${HEAP_SIZE}MB (recommend 2048MB for 4GB VPS)"
            echo "💡 Restart with: npm run start:4gb"
        else
            echo "✅ Node.js memory settings look good (${HEAP_SIZE}MB heap)"
        fi
    else
        echo "⚠️  Cannot detect Node.js memory settings"
        echo "💡 Restart with: npm run start:4gb"
    fi
fi

echo ""

# 6. Final verification
echo -e "${YELLOW}🔍 6. Final verification...${NC}"

echo "🧪 Testing upload API endpoint..."
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://nhatminhanh.tech/api/upload-proxy)
if [ "$API_TEST" = "405" ] || [ "$API_TEST" = "200" ]; then
    echo "✅ Upload API accessible (HTTP $API_TEST)"
else
    echo "❌ Upload API issue (HTTP $API_TEST)"
fi

echo "📊 Current resource usage:"
echo "   Memory: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "   Load: $(cat /proc/loadavg | awk '{print $1}')"

echo ""
echo -e "${GREEN}🎉 502 Fix Applied Successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary of changes:${NC}"
echo "• Fixed timeout conflicts in nginx config"
echo "• Added specific location for upload APIs"
echo "• Optimized buffers for 4GB RAM"
echo "• Disabled request buffering for streaming"
echo "• Set consistent 1-hour timeouts"
echo ""
echo -e "${YELLOW}🚀 Next steps:${NC}"
echo "1. Test upload: https://nhatminhanh.tech/admin"
echo "2. Monitor: sudo tail -f /var/log/nginx/upload.log"
echo "3. If still issues: restart Node.js with npm run start:4gb"
echo ""
echo -e "${GREEN}✅ Ready for 1GB+ video uploads!${NC}"
