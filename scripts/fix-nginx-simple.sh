#!/bin/bash

# Script simples para corrigir Nginx
# Execute: ./scripts/fix-nginx-simple.sh

set -e

echo "🔧 Corrigindo Nginx (versão simples)..."

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

# 1. Configurar Nginx apenas para HTTP
print_status "Configurando Nginx para HTTP..."
cat > /etc/nginx/sites-available/conexaogoias << 'EOF'
server {
    listen 80;
    server_name conexaogoias.com www.conexaogoias.com;
    
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
    }
}
EOF

# 2. Ativar o site
print_status "Ativando site..."
ln -sf /etc/nginx/sites-available/conexaogoias /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 3. Testar configuração
print_status "Testando configuração..."
if nginx -t; then
    print_status "✅ Configuração válida!"
else
    print_error "❌ Erro na configuração!"
    exit 1
fi

# 4. Recarregar Nginx
print_status "Recarregando Nginx..."
systemctl reload nginx

# 5. Verificar aplicação
print_status "Verificando aplicação..."
if ! pm2 list | grep -q "conexaogoias.*online"; then
    print_warning "Iniciando aplicação..."
    pm2 start conexaogoias
fi

print_status "✅ Nginx configurado para HTTP!"
print_info "Teste: curl -I http://conexaogoias.com"
print_info "Para SSL: certbot --nginx -d conexaogoias.com"
