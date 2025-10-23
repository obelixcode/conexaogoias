#!/bin/bash

# Script para corrigir dependências do Firebase Admin
# Execute: ./scripts/fix-firebase-deps.sh

set -e

echo "🔧 Corrigindo dependências do Firebase Admin..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# Parar aplicação se estiver rodando
print_status "Parando aplicação..."
pm2 stop conexaogoias 2>/dev/null || true

# Limpar node_modules e package-lock.json
print_status "Limpando dependências..."
rm -rf node_modules package-lock.json

# Reinstalar dependências
print_status "Reinstalando dependências..."
npm install --legacy-peer-deps --no-optional --force

# Instalar dependências específicas do Firebase Admin
print_status "Instalando dependências do Firebase Admin..."
npm install @google-cloud/firestore@latest --save
npm install @google-cloud/storage@latest --save
npm install @google-cloud/common@latest --save

# Verificar se as dependências foram instaladas
print_status "Verificando dependências..."
if [ -d "node_modules/@google-cloud/firestore" ]; then
    print_status "✅ @google-cloud/firestore instalado"
else
    print_error "❌ @google-cloud/firestore não instalado"
fi

if [ -d "node_modules/@google-cloud/storage" ]; then
    print_status "✅ @google-cloud/storage instalado"
else
    print_error "❌ @google-cloud/storage não instalado"
fi

# Tentar build
print_status "Tentando build..."
if npm run build; then
    print_status "✅ Build concluído com sucesso!"
    
    # Iniciar aplicação
    print_status "Iniciando aplicação..."
    pm2 start conexaogoias
    
    print_status "Aplicação iniciada com sucesso! 🎉"
else
    print_error "Build ainda falhou. Verificando logs..."
    
    # Mostrar logs de erro
    print_warning "Logs de erro:"
    npm run build 2>&1 | tail -20
    
    print_warning "Possíveis soluções:"
    print_warning "1. Verificar variáveis de ambiente"
    print_warning "2. Verificar se o Firebase está configurado corretamente"
    print_warning "3. Verificar se as chaves estão corretas"
fi
