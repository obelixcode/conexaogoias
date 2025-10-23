#!/bin/bash

# Script para corrigir configuração do Nginx e SSL
# Execute: ./scripts/fix-nginx-ssl.sh

set -e

echo "🔧 Corrigindo configuração do Nginx e SSL..."

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

# 1. Configurar Nginx apenas para HTTP primeiro
print_status "Configurando Nginx para HTTP (sem SSL)..."
cat > /etc/nginx/sites-available/conexaogoias << 'EOF'
server {
    listen 80;
    server_name conexaogoias.com www.conexaogoias.com;
    
    # Headers de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
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

# 2. Ativar o site
print_status "Ativando site no Nginx..."
ln -sf /etc/nginx/sites-available/conexaogoias /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 3. Testar configuração do Nginx
print_status "Testando configuração do Nginx..."
if nginx -t; then
    print_status "✅ Configuração do Nginx válida!"
else
    print_error "❌ Erro na configuração do Nginx!"
    exit 1
fi

# 4. Recarregar Nginx
print_status "Recarregando Nginx..."
systemctl reload nginx

# 5. Verificar se a aplicação está rodando
print_status "Verificando aplicação..."
if ! pm2 list | grep -q "conexaogoias.*online"; then
    print_warning "Aplicação não está rodando. Iniciando..."
    pm2 start conexaogoias
fi

# 6. Testar se o domínio responde
print_status "Testando resposta do domínio..."
sleep 5
if curl -s -I http://conexaogoias.com | grep -q "200 OK"; then
    print_status "✅ Domínio respondendo via HTTP!"
else
    print_warning "⚠️  Domínio pode não estar respondendo ainda"
    print_info "Verificando se o DNS está propagado..."
    nslookup conexaogoias.com
fi

# 7. Configurar SSL com Certbot
print_status "Configurando SSL com Certbot..."
if certbot --nginx -d conexaogoias.com -d www.conexaogoias.com --non-interactive --agree-tos --email admin@conexaogoias.com; then
    print_status "✅ SSL configurado com sucesso!"
    
    # 8. Verificar se HTTPS funciona
    print_status "Testando HTTPS..."
    sleep 5
    if curl -s -I https://conexaogoias.com | grep -q "200 OK"; then
        print_status "✅ HTTPS funcionando!"
    else
        print_warning "⚠️  HTTPS pode não estar funcionando ainda"
    fi
else
    print_warning "Falha na configuração automática do SSL"
    print_info "Execute manualmente: certbot --nginx -d conexaogoias.com -d www.conexaogoias.com"
fi

# 9. Atualizar URL no .env.production
print_status "Atualizando URL da aplicação..."
if [ -f ".env.production" ]; then
    sed -i 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://conexaogoias.com|' .env.production
    print_status "URL atualizada para: https://conexaogoias.com"
fi

# 10. Fazer build da aplicação
print_status "Fazendo build da aplicação..."
if npm run build; then
    print_status "✅ Build concluído com sucesso!"
else
    print_error "Build falhou!"
    exit 1
fi

# 11. Reiniciar aplicação
print_status "Reiniciando aplicação..."
pm2 restart conexaogoias

# 12. Verificar status final
print_status "Verificando status final..."
systemctl status nginx --no-pager
pm2 status

print_status "🎉 Nginx e SSL configurados com sucesso!"
print_info "Sistema acessível em:"
print_info "- HTTP: http://conexaogoias.com"
print_info "- HTTPS: https://conexaogoias.com"
print_warning "⚠️  Pode levar alguns minutos para o SSL ser ativado"
print_warning "⚠️  Verifique se o DNS está apontando corretamente para o IP do servidor"
