#!/bin/bash

# VPS Nginx Setup Script for Large File Upload
# Sử dụng: sudo bash vps-nginx-setup.sh

echo "🚀 VPS Nginx Setup for Large File Upload (1GB+)"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root: sudo bash vps-nginx-setup.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checking system...${NC}"

# Backup existing nginx config
if [ -f /etc/nginx/nginx.conf ]; then
    echo "🔄 Backing up existing nginx.conf..."
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
fi

# Update nginx.conf for large file uploads
echo -e "${YELLOW}⚙️ Updating nginx.conf for large file uploads...${NC}"

cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    ##
    # Basic Settings
    ##
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 1800;
    types_hash_max_size 2048;
    server_tokens off;

    ##
    # Large File Upload Settings
    ##
    client_max_body_size 5G;
    client_body_timeout 1800s;
    client_header_timeout 1800s;
    send_timeout 1800s;
    
    # Buffer sizes
    client_body_buffer_size 1M;
    client_header_buffer_size 4k;
    large_client_header_buffers 8 16k;
    
    # Hash bucket size
    server_names_hash_bucket_size 128;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ##
    # SSL Settings
    ##
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    ##
    # Logging Settings
    ##
    log_format upload_log '$remote_addr - $remote_user [$time_local] '
                         '"$request" $status $bytes_sent '
                         '"$http_referer" "$http_user_agent" '
                         'upload_time=$request_time '
                         'body_bytes_sent=$body_bytes_sent '
                         'content_length=$content_length';

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    ##
    # Gzip Settings
    ##
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    ##
    # Virtual Host Configs
    ##
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Create site configuration for large file upload
echo -e "${YELLOW}🌐 Creating site configuration...${NC}"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || hostname -I | cut -d' ' -f1)

cat > /etc/nginx/sites-available/large-file-upload << EOF
server {
    listen 80;
    server_name $SERVER_IP localhost;  # Thay bằng domain nếu có
    
    # Tăng giới hạn file upload lên 5GB
    client_max_body_size 5G;
    
    # Tăng timeout cho upload file lớn
    client_body_timeout 1800s;      # 30 phút
    client_header_timeout 1800s;    # 30 phút
    send_timeout 1800s;             # 30 phút
    
    # Tăng buffer size cho file lớn
    client_body_buffer_size 1M;
    
    # Tắt buffering để streaming upload
    proxy_request_buffering off;
    proxy_buffering off;
    
    # Location cho upload APIs - CRITICAL cho file lớn
    location ~ ^/api/(upload|admin) {
        # Proxy đến Next.js server
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CRITICAL: Tắt buffering cho upload
        proxy_request_buffering off;
        proxy_buffering off;
        
        # Headers cho large file upload
        proxy_set_header Content-Length \$content_length;
        proxy_set_header Content-Type \$content_type;
        
        # Timeouts cho upload lớn
        proxy_connect_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_read_timeout 1800s;
        
        # Disable gzip cho upload
        gzip off;
    }
    
    # Location cho admin pages
    location /admin {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_read_timeout 1800s;
    }
    
    # Default location cho các page khác
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Standard timeouts cho page thường
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
    
    # Logs cho debugging upload
    access_log /var/log/nginx/upload_access.log upload_log;
    error_log /var/log/nginx/upload_error.log;
}
EOF

# Enable site
echo -e "${YELLOW}🔗 Enabling site configuration...${NC}"
ln -sf /etc/nginx/sites-available/large-file-upload /etc/nginx/sites-enabled/

# Remove default site if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️ Removing default site..."
    rm /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
echo -e "${YELLOW}🧪 Testing nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    
    # Restart nginx
    echo -e "${YELLOW}🔄 Restarting nginx...${NC}"
    systemctl restart nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx restarted successfully${NC}"
    else
        echo -e "${RED}❌ Failed to restart nginx${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

# Enable nginx to start on boot
systemctl enable nginx

# Create monitoring script
echo -e "${YELLOW}📊 Creating upload monitoring script...${NC}"

cat > /usr/local/bin/monitor-upload.sh << 'EOF'
#!/bin/bash

# Monitor upload progress
echo "🔍 Upload Monitoring - $(date)"
echo "================================"

echo "📊 System Resources:"
free -h
echo ""

echo "🌐 Nginx Status:"
systemctl status nginx --no-pager -l
echo ""

echo "⚡ Node.js Processes:"
ps aux | grep node | grep -v grep
echo ""

echo "📁 Disk Usage:"
df -h
echo ""

echo "🌊 Recent Upload Logs (last 10 lines):"
tail -10 /var/log/nginx/upload_access.log 2>/dev/null || echo "No upload logs yet"
echo ""

echo "🔥 Recent Error Logs (last 5 lines):"
tail -5 /var/log/nginx/upload_error.log 2>/dev/null || echo "No error logs"
echo ""

echo "📈 Network Connections:"
netstat -an | grep :3000 | head -5
EOF

chmod +x /usr/local/bin/monitor-upload.sh

# Create systemd service for easy monitoring
cat > /etc/systemd/system/monitor-upload.service << 'EOF'
[Unit]
Description=Upload Monitoring Service
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/monitor-upload.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "• Nginx configured for 5GB file uploads"
echo "• Timeouts set to 30 minutes"
echo "• Buffering disabled for streaming"
echo "• Logs available at /var/log/nginx/upload_*.log"
echo "• Server IP: $SERVER_IP"
echo ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo "1. Start your Node.js app on port 3000"
echo "2. Test upload at: http://$SERVER_IP/admin"
echo "3. Monitor with: sudo /usr/local/bin/monitor-upload.sh"
echo ""
echo -e "${YELLOW}🛠️ Troubleshooting Commands:${NC}"
echo "• Check nginx status: sudo systemctl status nginx"
echo "• View upload logs: sudo tail -f /var/log/nginx/upload_access.log"
echo "• View error logs: sudo tail -f /var/log/nginx/upload_error.log"
echo "• Test nginx config: sudo nginx -t"
echo "• Restart nginx: sudo systemctl restart nginx"
echo ""
echo -e "${GREEN}✅ Ready for large file uploads!${NC}"
