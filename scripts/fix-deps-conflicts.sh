#!/bin/bash

# Script para resolver conflitos de dependências React/WordPress
# Execute: ./scripts/fix-deps-conflicts.sh

set -e

echo "🔧 Resolvendo conflitos de dependências..."

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

# Limpar dependências
print_status "Limpando dependências..."
rm -rf node_modules package-lock.json

# Criar .npmrc para forçar resolução
print_status "Configurando .npmrc..."
cat > .npmrc << 'EOF'
legacy-peer-deps=true
force=true
auto-install-peers=false
EOF

# Instalar dependências com resolução forçada
print_status "Instalando dependências com resolução forçada..."
npm install --legacy-peer-deps --no-optional --force

# Verificar se as dependências foram instaladas
print_status "Verificando dependências críticas..."
if [ -d "node_modules/react" ]; then
    print_status "✅ React instalado"
else
    print_error "❌ React não instalado"
fi

if [ -d "node_modules/@wordpress/block-editor" ]; then
    print_status "✅ WordPress Block Editor instalado"
else
    print_error "❌ WordPress Block Editor não instalado"
fi

if [ -d "node_modules/firebase" ]; then
    print_status "✅ Firebase instalado"
else
    print_error "❌ Firebase não instalado"
fi

# Tentar build
print_status "Tentando build..."
if npm run build; then
    print_status "✅ Build concluído com sucesso!"
    
    # Iniciar aplicação
    print_status "Iniciando aplicação..."
    pm2 start conexaogoias
    
    print_status "Conflitos de dependências resolvidos! 🎉"
else
    print_error "Build ainda falhou. Verificando logs..."
    
    # Mostrar logs de erro
    print_warning "Logs de erro:"
    npm run build 2>&1 | tail -20
    
    print_warning "Possíveis soluções:"
    print_warning "1. Verificar se todas as dependências foram instaladas"
    print_warning "2. Verificar variáveis de ambiente"
    print_warning "3. Verificar se o Firebase está configurado corretamente"
fi
