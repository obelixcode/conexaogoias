#!/bin/bash

# Script para configurar domínio e SSL
# Execute: ./scripts/setup-domain-ssl.sh

set -e

echo "🌐 Configurando domínio e SSL para conexaogoias.com..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script deve ser executado como root"
    exit 1
fi

# Parar aplicação se estiver rodando
print_status "Parando aplicação..."
pm2 stop conexaogoias 2>/dev/null || true

# 1. Atualizar URL no .env.production
print_status "Atualizando URL da aplicação..."
if [ -f ".env.production" ]; then
    sed -i 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://conexaogoias.com|' .env.production
    print_status "URL atualizada para: https://conexaogoias.com"
else
    print_error "Arquivo .env.production não encontrado!"
    exit 1
fi

# 2. Configurar Nginx para o domínio
print_status "Configurando Nginx para conexaogoias.com..."
cat > /etc/nginx/sites-available/conexaogoias << 'EOF'
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
    ssl_certificate /etc/letsencrypt/live/conexaogoias.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/conexaogoias.com/privkey.pem;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy para a aplicação Next.js
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
    
    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 3. Ativar o site
print_status "Ativando site no Nginx..."
ln -sf /etc/nginx/sites-available/conexaogoias /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 4. Testar configuração do Nginx
print_status "Testando configuração do Nginx..."
if nginx -t; then
    print_status "Configuração do Nginx válida!"
else
    print_error "Erro na configuração do Nginx!"
    exit 1
fi

# 5. Recarregar Nginx
print_status "Recarregando Nginx..."
systemctl reload nginx

# 6. Configurar SSL com Certbot
print_status "Configurando SSL com Certbot..."
if certbot --nginx -d conexaogoias.com -d www.conexaogoias.com --non-interactive --agree-tos --email admin@conexaogoias.com; then
    print_status "✅ SSL configurado com sucesso!"
else
    print_warning "Falha na configuração automática do SSL"
    print_info "Execute manualmente: certbot --nginx -d conexaogoias.com -d www.conexaogoias.com"
fi

# 7. Fazer build da aplicação
print_status "Fazendo build da aplicação..."
if npm run build; then
    print_status "✅ Build concluído com sucesso!"
else
    print_error "Build falhou!"
    exit 1
fi

# 8. Iniciar aplicação
print_status "Iniciando aplicação..."
pm2 start conexaogoias

# 9. Verificar status
print_status "Verificando status dos serviços..."
systemctl status nginx --no-pager
pm2 status

print_status "🎉 Domínio e SSL configurados com sucesso!"
print_info "Sistema acessível em: https://conexaogoias.com"
print_warning "⚠️  Pode levar alguns minutos para o SSL ser ativado"
print_warning "⚠️  Verifique se o DNS está apontando corretamente para o IP do servidor"
