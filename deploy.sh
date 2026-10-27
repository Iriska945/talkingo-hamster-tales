#!/bin/bash
# Talkingo Full-Stack Deployment Script for AWS EC2 (Ubuntu 24.04)
set -e

echo "🚀 Starting Talkingo Full-Stack Deployment on AWS EC2..."

# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Add 2GB Swap Memory (ensures t3.micro never crashes during build)
if [ ! -f /swapfile ]; then
    echo "⚙️ Creating 2GB Swap file for smooth builds..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 3. Install Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    sudo apt install -y docker.io git
    sudo systemctl enable --now docker
    sudo usermod -aG docker $USER
fi

# 4. Prepare .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        cat << 'EOF' > .env
PORT=8080
LINKBUS_API_KEY=
LINKBUS_BASE_URL=https://www.linkbus.net/v1
LINKBUS_MODEL=deepseek-v4-flash
EOF
    fi
fi

# 5. Build and launch container on Port 80
echo "🔨 Building Docker image (frontend + backend)..."
sudo docker build -t talkingo-fullstack .

echo "🚢 Running container on port 80..."
sudo docker stop talkingo 2>/dev/null || true
sudo docker rm talkingo 2>/dev/null || true
sudo docker run -d \
  --name talkingo \
  --restart always \
  --env-file .env \
  -p 80:8080 \
  talkingo-fullstack

echo ""
echo "=========================================================="
echo "🎉 Готово! Сервер запущен на 80 порту."
echo "Откройте в браузере: http://$(curl -s ifconfig.me)/"
echo "=========================================================="
