#!/bin/bash

# Script para corrigir problemas de domínio
# Execute: ./scripts/fix-domain.sh

set -e

echo "🔧 Corrigindo problemas de domínio..."

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

# 1. Verificar se a aplicação está rodando
print_status "Verificando status da aplicação..."
if pm2 list | grep -q "conexaogoias.*online"; then
    print_status "✅ Aplicação rodando"
else
    print_warning "Aplicação não está rodando. Iniciando..."
    pm2 start conexaogoias
fi

# 2. Verificar se Nginx está rodando
print_status "Verificando status do Nginx..."
if systemctl is-active --quiet nginx; then
    print_status "✅ Nginx rodando"
else
    print_warning "Nginx não está rodando. Iniciando..."
    systemctl start nginx
fi

# 3. Verificar configuração do Nginx
print_status "Verificando configuração do Nginx..."
if nginx -t; then
    print_status "✅ Configuração do Nginx válida"
else
    print_error "❌ Erro na configuração do Nginx"
    print_info "Verificando arquivos de configuração..."
    ls -la /etc/nginx/sites-enabled/
fi

# 4. Verificar se o domínio está apontando para o servidor
print_status "Verificando DNS..."
SERVER_IP=$(curl -s ifconfig.me)
print_info "IP do servidor: $SERVER_IP"

# Verificar se o domínio resolve para o IP correto
if nslookup conexaogoias.com | grep -q "$SERVER_IP"; then
    print_status "✅ DNS configurado corretamente"
else
    print_warning "⚠️  DNS pode não estar configurado corretamente"
    print_info "Verifique se o domínio está apontando para: $SERVER_IP"
fi

# 5. Verificar se a aplicação responde na porta 3000
print_status "Verificando aplicação na porta 3000..."
if curl -s http://localhost:3000 > /dev/null; then
    print_status "✅ Aplicação respondendo na porta 3000"
else
    print_error "❌ Aplicação não está respondendo na porta 3000"
    print_info "Verificando logs da aplicação..."
    pm2 logs conexaogoias --lines 10
fi

# 6. Verificar se Nginx está redirecionando corretamente
print_status "Verificando redirecionamento do Nginx..."
if curl -s http://localhost > /dev/null; then
    print_status "✅ Nginx redirecionando corretamente"
else
    print_error "❌ Nginx não está redirecionando"
    print_info "Verificando configuração do Nginx..."
    cat /etc/nginx/sites-enabled/conexaogoias
fi

# 7. Verificar SSL
print_status "Verificando SSL..."
if [ -f "/etc/letsencrypt/live/conexaogoias.com/fullchain.pem" ]; then
    print_status "✅ Certificado SSL encontrado"
else
    print_warning "⚠️  Certificado SSL não encontrado"
    print_info "Execute: certbot --nginx -d conexaogoias.com -d www.conexaogoias.com"
fi

# 8. Mostrar informações de diagnóstico
print_info "=== DIAGNÓSTICO ==="
print_info "IP do servidor: $SERVER_IP"
print_info "Status da aplicação: $(pm2 list | grep conexaogoias | awk '{print $10}')"
print_info "Status do Nginx: $(systemctl is-active nginx)"
print_info "Porta 3000: $(netstat -tlnp | grep :3000 | wc -l) processos"
print_info "Porta 80: $(netstat -tlnp | grep :80 | wc -l) processos"
print_info "Porta 443: $(netstat -tlnp | grep :443 | wc -l) processos"

print_info ""
print_info "=== PRÓXIMOS PASSOS ==="
print_info "1. Verifique se o DNS está apontando para: $SERVER_IP"
print_info "2. Aguarde propagação do DNS (pode levar até 24h)"
print_info "3. Configure SSL: certbot --nginx -d conexaogoias.com"
print_info "4. Teste: curl -I https://conexaogoias.com"
