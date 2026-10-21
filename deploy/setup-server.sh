#!/usr/bin/env bash
# ECS 一次性初始化：装 nginx、装站点配置、放行系统防火墙。root 或 sudo 执行。
set -euo pipefail

if [ "$(id -u)" != 0 ]; then echo "请用 root 或 sudo 运行"; exit 1; fi

# 按脚本自身位置找 nginx.conf，不依赖你在哪个目录执行
HERE="$(cd "$(dirname "$0")" && pwd)"

if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y nginx
    NGINX_USER=www-data
elif command -v dnf >/dev/null 2>&1; then
    dnf install -y nginx
    NGINX_USER=nginx
elif command -v yum >/dev/null 2>&1; then
    yum install -y nginx
    NGINX_USER=nginx
else
    echo "没找到 apt-get / dnf / yum，请手动安装 nginx"; exit 1
fi

mkdir -p /var/www/digital-forecast
chown -R "$NGINX_USER" /var/www

cp "$HERE/nginx.conf" /etc/nginx/conf.d/digital-forecast.conf
nginx -t
systemctl enable --now nginx
systemctl reload nginx

# 系统防火墙。阿里云还有一层「安全组」在控制台里，这里管不到，必须单独放行 80/443。
if command -v firewall-cmd >/dev/null 2>&1; then
    firewall-cmd --permanent --add-service=http --add-service=https
    firewall-cmd --reload
elif command -v ufw >/dev/null 2>&1; then
    ufw allow 80/tcp
    ufw allow 443/tcp
fi

echo "nginx 已就绪。下一步：阿里云控制台 → ECS → 安全组 → 入方向放行 80（和 443）。"
