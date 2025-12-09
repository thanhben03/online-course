#!/bin/bash

# VPS Server Startup Script cho Upload Video Lớn
# Sử dụng: bash start-vps-server.sh [mode]

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 VPS Server Startup for Large File Upload${NC}"
echo "=============================================="

# Parse mode
MODE=${1:-production}
valid_modes=("dev" "production" "vps")

if [[ ! " ${valid_modes[@]} " =~ " ${MODE} " ]]; then
    echo -e "${RED}❌ Invalid mode: ${MODE}${NC}"
    echo -e "${YELLOW}Valid modes: ${valid_modes[*]}${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Selected mode: ${MODE}${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Are you in the project root?${NC}"
    exit 1
fi

# Check Node.js version
node_version=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Node.js: ${node_version}${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Check environment variables
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Make sure to set AWS credentials${NC}"
fi

# Memory configuration based on mode
case $MODE in
    "dev")
        MEMORY_CONFIG="--max-old-space-size=512 --expose-gc"
        SCRIPT="dev"
        DESCRIPTION="Development với memory 512MB"
        ;;
    "production")
        MEMORY_CONFIG="--max-old-space-size=768 --optimize-for-size --expose-gc"
        SCRIPT="dev:production"
        DESCRIPTION="Production với memory 768MB, tối ưu size"
        ;;
    "vps")
        MEMORY_CONFIG="--max-old-space-size=1024 --optimize-for-size --expose-gc"
        SCRIPT="start:vps"
        DESCRIPTION="VPS mode với memory 1GB, tối ưu cho file lớn"
        ;;
esac

echo -e "${BLUE}⚙️  Memory Configuration:${NC}"
echo "   Mode: $MODE"
echo "   Description: $DESCRIPTION"
echo "   Node Options: $MEMORY_CONFIG"
echo ""

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Check if port 3000 is available
if ! check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo "Current processes on port 3000:"
    lsof -Pi :3000 -sTCP:LISTEN
    echo ""
    read -p "Do you want to kill existing processes? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🔄 Killing processes on port 3000...${NC}"
        pkill -f "next"
        sleep 2
    else
        echo -e "${RED}❌ Cannot start server. Port 3000 is occupied${NC}"
        exit 1
    fi
fi

# Function to display system info
show_system_info() {
    echo -e "${BLUE}💻 System Information:${NC}"
    echo "   RAM Total: $(free -h | awk 'NR==2{print $2}')"
    echo "   RAM Available: $(free -h | awk 'NR==2{print $7}')"
    echo "   Disk Space: $(df -h . | awk 'NR==2{print $4}') available"
    echo "   CPU Cores: $(nproc)"
    echo ""
}

show_system_info

# Function to display monitoring commands
show_monitoring_commands() {
    echo -e "${YELLOW}📊 Monitoring Commands:${NC}"
    echo "   Memory usage: watch -n 1 'free -h'"
    echo "   Node.js process: ps aux | grep node"
    echo "   Server logs: tail -f ~/.pm2/logs/upload-app-out.log"
    echo "   Upload logs: sudo tail -f /var/log/nginx/upload_access.log"
    echo ""
}

# Ask for startup method
echo -e "${YELLOW}🚀 Choose startup method:${NC}"
echo "1) Direct startup (npm run)"
echo "2) PM2 startup (recommended for VPS)"
echo "3) Screen session"
read -p "Enter choice (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo -e "${YELLOW}🔄 Starting server with npm...${NC}"
        echo "Press Ctrl+C to stop"
        echo ""
        
        # Show what will be executed
        echo -e "${BLUE}Executing: NODE_OPTIONS='${MEMORY_CONFIG}' npm run ${SCRIPT}${NC}"
        echo ""
        
        # Start server
        NODE_OPTIONS="${MEMORY_CONFIG}" npm run ${SCRIPT}
        ;;
    2)
        # Check if PM2 is installed
        if ! command -v pm2 &> /dev/null; then
            echo -e "${YELLOW}📦 Installing PM2...${NC}"
            npm install -g pm2
        fi
        
        echo -e "${YELLOW}🔄 Starting server with PM2...${NC}"
        
        # Stop existing instance
        pm2 stop upload-app 2>/dev/null || true
        pm2 delete upload-app 2>/dev/null || true
        
        # Start with PM2
        NODE_OPTIONS="${MEMORY_CONFIG}" pm2 start npm --name "upload-app" -- run ${SCRIPT}
        
        # Show PM2 status
        pm2 status
        
        echo ""
        echo -e "${GREEN}✅ Server started with PM2${NC}"
        echo -e "${YELLOW}📊 PM2 Commands:${NC}"
        echo "   View status: pm2 status"
        echo "   View logs: pm2 logs upload-app"
        echo "   Restart: pm2 restart upload-app"
        echo "   Stop: pm2 stop upload-app"
        echo "   Monitor: pm2 monit"
        
        # Setup PM2 startup if needed
        echo ""
        read -p "Setup PM2 to start on boot? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pm2 startup
            pm2 save
            echo -e "${GREEN}✅ PM2 startup configured${NC}"
        fi
        ;;
    3)
        # Check if screen is installed
        if ! command -v screen &> /dev/null; then
            echo -e "${YELLOW}📦 Installing screen...${NC}"
            sudo apt-get update && sudo apt-get install -y screen
        fi
        
        echo -e "${YELLOW}🔄 Starting server in screen session...${NC}"
        
        # Start in screen session
        screen -dmS upload-server bash -c "NODE_OPTIONS='${MEMORY_CONFIG}' npm run ${SCRIPT}"
        
        echo -e "${GREEN}✅ Server started in screen session 'upload-server'${NC}"
        echo -e "${YELLOW}📊 Screen Commands:${NC}"
        echo "   Attach to session: screen -r upload-server"
        echo "   List sessions: screen -ls"
        echo "   Detach from session: Ctrl+A, then D"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# Wait a moment for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo ""
    echo -e "${GREEN}🎉 Server is running successfully!${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access URLs:${NC}"
    echo "   Local: http://localhost:3000"
    echo "   Admin: http://localhost:3000/admin"
    
    # Try to get public IP
    public_ip=$(curl -s ifconfig.me 2>/dev/null || hostname -I | cut -d' ' -f1)
    if [ ! -z "$public_ip" ]; then
        echo "   Public: http://${public_ip}:3000"
        echo "   Admin Public: http://${public_ip}:3000/admin"
    fi
    
    echo ""
    show_monitoring_commands
    
    echo -e "${GREEN}🎬 Ready for large file uploads!${NC}"
else
    echo ""
    echo -e "${RED}❌ Server failed to start or not responding${NC}"
    echo "Check the logs for errors"
fi
