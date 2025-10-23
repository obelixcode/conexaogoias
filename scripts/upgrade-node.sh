#!/bin/bash

# Script para atualizar Node.js para versão 20
# Execute: ./scripts/upgrade-node.sh

set -e

echo "🔄 Atualizando Node.js para versão 20..."

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

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script deve ser executado como root"
    exit 1
fi

# Verificar versão atual
CURRENT_VERSION=$(node --version)
print_status "Versão atual do Node.js: $CURRENT_VERSION"

# Verificar se já é Node.js 20+
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    print_status "Node.js já está na versão 20 ou superior!"
    exit 0
fi

# Parar aplicação se estiver rodando
print_status "Parando aplicação..."
pm2 stop conexaogoias 2>/dev/null || true

# Atualizar Node.js
print_status "Atualizando Node.js para versão 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install nodejs

# Verificar nova versão
NEW_VERSION=$(node --version)
print_status "Nova versão do Node.js: $NEW_VERSION"

# Verificar se a atualização foi bem-sucedida
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    print_status "✅ Node.js atualizado com sucesso!"
    
    # Reinstalar dependências
    print_status "Reinstalando dependências..."
    cd /var/www/conexaogoias
    rm -rf node_modules package-lock.json
    
    # Criar .npmrc para forçar resolução
    print_status "Configurando resolução de dependências..."
    cat > .npmrc << 'EOF'
legacy-peer-deps=true
force=true
auto-install-peers=false
EOF
    
    npm install --legacy-peer-deps --no-optional --force
    
    # Fazer build
    print_status "Fazendo build da aplicação..."
    npm run build
    
    # Iniciar aplicação
    print_status "Iniciando aplicação..."
    pm2 start conexaogoias
    
    print_status "Aplicação atualizada e funcionando! 🎉"
else
    print_error "Falha na atualização do Node.js"
    exit 1
fi
