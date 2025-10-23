#!/bin/bash

# Script para configurar Firebase automaticamente
# Execute: ./scripts/configure-firebase.sh

set -e

echo "🔥 Configurando Firebase automaticamente..."

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
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# Parar aplicação se estiver rodando
print_status "Parando aplicação..."
pm2 stop conexaogoias 2>/dev/null || true

# Criar arquivo .env.production com configurações corretas
print_status "Criando arquivo .env.production com configurações corretas..."
cat > .env.production << 'EOF'
# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA5BwEYT1gmKz20rbGjKISeXOf8Dt2Qu0o
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aconexaogoias.iam.gserviceaccount.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
EOF

print_warning "⚠️  IMPORTANTE: Configure as credenciais reais do Firebase!"
print_info ""
print_info "Para obter as credenciais do Firebase:"
print_info "1. Acesse: https://console.firebase.google.com/"
print_info "2. Selecione o projeto 'aconexaogoias'"
print_info "3. Vá em 'Configurações do projeto' > 'Contas de serviço'"
print_info "4. Clique em 'Gerar nova chave privada'"
print_info "5. Baixe o arquivo JSON"
print_info "6. Copie as configurações para o arquivo .env.production"
print_info ""
print_info "Edite o arquivo:"
print_info "nano .env.production"
print_info ""
print_info "Substitua os valores:"
print_info "- NEXT_PUBLIC_FIREBASE_API_KEY (do arquivo JSON)"
print_info "- FIREBASE_ADMIN_PRIVATE_KEY (do arquivo JSON)"
print_info "- FIREBASE_ADMIN_CLIENT_EMAIL (do arquivo JSON)"
print_info "- NEXT_PUBLIC_APP_URL (URL do seu servidor)"
print_info ""
print_warning "Após configurar, execute:"
print_warning "pm2 restart conexaogoias"
