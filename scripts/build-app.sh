#!/bin/bash

# Script para fazer build da aplicação
# Execute: ./scripts/build-app.sh

set -e

echo "🔨 Fazendo build da aplicação Conexão Goiás..."

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

# Verificar se o arquivo de ambiente existe
if [ ! -f ".env.production" ]; then
    print_error "Arquivo .env.production não encontrado!"
    print_warning "Crie o arquivo .env.production com as configurações necessárias"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependências..."
    npm install --legacy-peer-deps --no-optional
fi

# Instalar dependências específicas do Firebase Admin
print_status "Verificando dependências do Firebase Admin..."
npm install @google-cloud/firestore @google-cloud/storage --save

# Limpar build anterior
if [ -d ".next" ]; then
    print_status "Limpando build anterior..."
    rm -rf .next
fi

# Fazer build
print_status "Fazendo build da aplicação..."
if npm run build; then
    print_status "Build concluído com sucesso! 🎉"
    
    # Verificar se o build foi criado
    if [ -d ".next" ]; then
        print_status "Diretório .next criado com sucesso"
        ls -la .next/
    else
        print_error "Diretório .next não foi criado"
        exit 1
    fi
else
    print_error "Build falhou!"
    print_warning "Possíveis soluções:"
    print_warning "1. Verificar variáveis de ambiente"
    print_warning "2. Verificar dependências: npm install"
    print_warning "3. Verificar erros de TypeScript"
    print_warning "4. Verificar erros de ESLint"
    exit 1
fi

print_status "Aplicação pronta para produção! 🚀"
