#!/bin/bash

# Script para atualizar regras do Firestore localmente
# Execute: ./scripts/update-firestore-rules.sh

set -e

echo "📝 Atualizando regras do Firestore..."

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

# Verificar se estamos no diretório correto
if [ ! -f "firestore.rules" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# Backup das regras atuais
print_status "Fazendo backup das regras atuais..."
cp firestore.rules firestore.rules.backup

# Criar regras permissivas para desenvolvimento
print_status "Criando regras permissivas para desenvolvimento..."
cat > firestore.rules << 'EOF'
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Regras permissivas para desenvolvimento
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF

print_status "Regras do Firestore atualizadas localmente!"

# Atualizar URL da aplicação se necessário
print_status "Verificando URL da aplicação..."
if grep -q "localhost" .env.production; then
    print_warning "URL ainda está como localhost. Atualizando..."
    
    # Obter IP público do servidor
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "localhost")
    
    # Atualizar URL no .env.production
    sed -i "s|NEXT_PUBLIC_APP_URL=http://localhost:3000|NEXT_PUBLIC_APP_URL=http://$PUBLIC_IP|" .env.production
    
    print_status "URL atualizada para: http://$PUBLIC_IP"
fi

print_info "Para aplicar as regras no Firebase:"
print_info "1. Execute: firebase login"
print_info "2. Execute: firebase deploy --only firestore:rules"
print_info ""
print_warning "⚠️  As regras estão em modo desenvolvimento (muito permissivas)"
print_warning "⚠️  Configure regras mais restritivas para produção"
print_info ""
print_info "Regras atualizadas localmente! Execute o deploy quando estiver pronto."
