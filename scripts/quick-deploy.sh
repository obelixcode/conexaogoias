#!/bin/bash

# Script de deploy rápido para DigitalOcean
# Execute este script no servidor após a configuração inicial

set -e

echo "🚀 Deploy rápido do Conexão Goiás..."

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

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# Parar aplicação
print_status "Parando aplicação..."
pm2 stop conexaogoias || true

# Fazer backup
if [ -d ".next" ]; then
    print_status "Fazendo backup..."
    cp -r .next .next.backup.$(date +%Y%m%d_%H%M%S)
fi

# Atualizar código
print_status "Atualizando código..."
git pull origin main

# Instalar dependências
print_status "Instalando dependências..."
npm install --legacy-peer-deps

# Fazer build
print_status "Fazendo build..."
npm run build

# Iniciar aplicação
print_status "Iniciando aplicação..."
pm2 start conexaogoias

# Verificar status
print_status "Verificando status..."
pm2 status

# Verificar se está funcionando
print_status "Testando aplicação..."
sleep 5
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Aplicação funcionando corretamente!"
else
    print_warning "Aplicação pode não estar funcionando. Verifique os logs:"
    echo "pm2 logs conexaogoias"
fi

print_status "Deploy concluído! 🎉"
