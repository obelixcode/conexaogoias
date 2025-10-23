#!/bin/bash

# Script para corrigir configuração do Nginx
# Uso: ./scripts/fix-nginx.sh

VPS_IP="146.190.174.106"
VPS_USER="root"
VPS_PASSWORD="1S5Yy9if2x"

echo "🔧 CORRIGIR NGINX - CONEXÃO GOIÁS"
echo "=================================="

echo "1. Conectando na VPS e corrigindo Nginx..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" << 'EOF'
echo "🔧 Corrigindo configuração do Nginx..."
cat > /etc/nginx/sites-available/conexaogoias.com << 'NGINXEOF'
server {
    listen 80;
    server_name conexaogoias.com www.conexaogoias.com;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name conexaogoias.com www.conexaogoias.com;
    
    # SSL será configurado pelo Certbot
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Configurações de performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Proxy para aplicação Next.js
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
        proxy_read_timeout 86400;
    }
    
    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

echo "🔍 Testando configuração do Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração válida!"
    echo "🔄 Reiniciando Nginx..."
    systemctl restart nginx
    systemctl status nginx --no-pager
    
    echo "🔒 Configurando SSL com Let's Encrypt..."
    certbot --nginx -d conexaogoias.com -d www.conexaogoias.com --non-interactive --agree-tos --email admin@conexaogoias.com
    
    echo "📅 Configurando renovação automática do SSL..."
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    echo "🌐 Testando aplicação..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000
    curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost
    
    echo "✅ Nginx corrigido e funcionando!"
else
    echo "❌ Erro na configuração do Nginx"
    echo "📋 Logs de erro:"
    nginx -t
fi
EOF

echo ""
echo "🎯 Próximos passos:"
echo "1. Configure os DNS na Cloudflare"
echo "2. Aguarde propagação DNS (5-15 minutos)"
echo "3. Teste: https://conexaogoias.com"
