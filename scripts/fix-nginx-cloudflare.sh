#!/bin/bash

# Script para corrigir Nginx com Cloudflare
# Uso: ./scripts/fix-nginx-cloudflare.sh

VPS_IP="146.190.174.106"
VPS_USER="root"
VPS_PASSWORD="1S5Yy9if2x"

echo "🔧 CORRIGIR NGINX CLOUDFLARE - CONEXÃO GOIÁS"
echo "============================================="

echo "1. Conectando na VPS e corrigindo Nginx..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" << 'EOF'
echo "🔍 Verificando configuração atual do Nginx..."
nginx -t

echo "🔧 Corrigindo configuração do Nginx para Cloudflare..."
cat > /etc/nginx/sites-available/conexaogoias.com << 'NGINXEOF'
server {
    listen 80;
    server_name conexaogoias.com www.conexaogoias.com;
    
    # Configurações para Cloudflare
    real_ip_header CF-Connecting-IP;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
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
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
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
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
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
    
    echo "📊 Status do Nginx:"
    systemctl status nginx --no-pager
    
    echo "🌐 Testando aplicação..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000
    curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost
    curl -s -o /dev/null -w "Status: %{http_code}\n" http://conexaogoias.com
    
    echo "🔒 Configurando SSL com Let's Encrypt..."
    certbot --nginx -d conexaogoias.com -d www.conexaogoias.com --non-interactive --agree-tos --email admin@conexaogoias.com
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL configurado com sucesso!"
        echo "📅 Configurando renovação automática do SSL..."
        echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
        
        echo "🔄 Reiniciando Nginx após SSL..."
        systemctl restart nginx
        
        echo "🌐 Testando HTTPS..."
        curl -s -o /dev/null -w "Status: %{http_code}\n" https://conexaogoias.com
        curl -s -o /dev/null -w "Status: %{http_code}\n" https://www.conexaogoias.com
    else
        echo "⚠️ SSL não configurado, mas HTTP funcionando"
    fi
    
    echo "✅ Nginx corrigido para Cloudflare!"
else
    echo "❌ Erro na configuração do Nginx"
    echo "📋 Logs de erro:"
    nginx -t
fi
EOF

echo ""
echo "🎯 Próximos passos:"
echo "1. Aguarde 2-3 minutos para propagação"
echo "2. Teste: http://conexaogoias.com"
echo "3. Teste: https://conexaogoias.com"
echo "4. Se ainda não funcionar, execute: ./scripts/check-setup.sh"
