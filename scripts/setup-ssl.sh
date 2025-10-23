#!/bin/bash

# Script para configurar SSL automaticamente
# Execute: ./scripts/setup-ssl.sh seu-dominio.com

set -e

if [ -z "$1" ]; then
    echo "❌ Uso: ./scripts/setup-ssl.sh seu-dominio.com"
    exit 1
fi

DOMAIN=$1

echo "🔒 Configurando SSL para $DOMAIN..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Atualizar configuração do Nginx com o domínio
print_status "Atualizando configuração do Nginx..."
cat > /etc/nginx/sites-available/conexaogoias << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Main location
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
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Testar configuração
print_status "Testando configuração do Nginx..."
nginx -t

# Recarregar Nginx
print_status "Recarregando Nginx..."
systemctl reload nginx

# Obter certificado SSL
print_status "Obtendo certificado SSL..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Configurar renovação automática
print_status "Configurando renovação automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Atualizar arquivo de ambiente
print_status "Atualizando arquivo de ambiente..."
sed -i "s|NEXT_PUBLIC_APP_URL=https://seu-dominio.com|NEXT_PUBLIC_APP_URL=https://$DOMAIN|g" /var/www/conexaogoias/.env.production

# Reiniciar aplicação
print_status "Reiniciando aplicação..."
pm2 restart conexaogoias

# Verificar status
print_status "Verificando status..."
pm2 status

# Testar HTTPS
print_status "Testando HTTPS..."
sleep 5
if curl -f https://$DOMAIN > /dev/null 2>&1; then
    print_status "HTTPS funcionando corretamente!"
    echo "🌐 Acesse: https://$DOMAIN"
else
    print_warning "HTTPS pode não estar funcionando. Verifique:"
    echo "1. DNS apontando para o servidor"
    echo "2. Firewall configurado"
    echo "3. Certificado SSL válido"
fi

print_status "SSL configurado com sucesso! 🔒"
echo ""
echo "📋 Informações importantes:"
echo "  Domínio: https://$DOMAIN"
echo "  Certificado: Renovação automática configurada"
echo "  Aplicação: Rodando na porta 3000"
echo "  Proxy: Nginx configurado"
echo ""
echo "🔧 Comandos úteis:"
echo "  pm2 status          - Status da aplicação"
echo "  pm2 logs conexaogoias - Logs da aplicação"
echo "  nginx -t            - Testar configuração"
echo "  certbot certificates - Ver certificados"
