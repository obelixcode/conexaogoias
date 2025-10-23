#!/bin/bash

# Script para corrigir configuração do Firebase
# Execute: ./scripts/fix-firebase-config.sh

set -e

echo "🔧 Corrigindo configuração do Firebase..."

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

# Verificar se o arquivo .env.production existe
if [ ! -f ".env.production" ]; then
    print_error "Arquivo .env.production não encontrado!"
    exit 1
fi

# Verificar se ainda tem configurações de exemplo
if grep -q "your_project_id" .env.production; then
    print_warning "Configurações de exemplo detectadas no .env.production"
    print_info "Você precisa configurar as credenciais reais do Firebase"
    print_info ""
    print_info "Para configurar o Firebase:"
    print_info "1. Acesse: https://console.firebase.google.com/"
    print_info "2. Selecione seu projeto"
    print_info "3. Vá em 'Configurações do projeto' > 'Contas de serviço'"
    print_info "4. Gere uma nova chave privada"
    print_info "5. Copie as configurações para o arquivo .env.production"
    print_info ""
    print_warning "Exemplo de configuração:"
    echo ""
    echo "# Firebase Configuration (Public)"
    echo "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA5BwEYT1gmKz20rbGjKISeXOf8Dt2Qu0o"
    echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com"
    echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias"
    echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app"
    echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789"
    echo "NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456"
    echo ""
    echo "# Firebase Admin Configuration"
    echo "FIREBASE_ADMIN_PROJECT_ID=aconexaogoias"
    echo "FIREBASE_ADMIN_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n\""
    echo "FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aconexaogoias.iam.gserviceaccount.com"
    echo ""
    echo "# App Configuration"
    echo "NEXT_PUBLIC_APP_URL=http://seu-dominio.com"
    echo "NODE_ENV=production"
    echo ""
    print_warning "⚠️  IMPORTANTE: Substitua os valores acima pelas suas configurações reais!"
    print_warning "⚠️  Especialmente: FIREBASE_ADMIN_PRIVATE_KEY e NEXT_PUBLIC_APP_URL"
    print_info ""
    print_info "Após configurar, execute:"
    print_info "nano .env.production"
    print_info "pm2 restart conexaogoias"
    exit 1
fi

# Verificar se as configurações estão corretas
print_status "Verificando configurações do Firebase..."

# Verificar se não tem mais "your_project_id"
if grep -q "your_project_id" .env.production; then
    print_error "Ainda há configurações de exemplo no arquivo!"
    print_warning "Edite o arquivo .env.production com suas configurações reais"
    exit 1
fi

# Verificar se tem as variáveis necessárias
REQUIRED_VARS=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "FIREBASE_ADMIN_PROJECT_ID"
    "FIREBASE_ADMIN_PRIVATE_KEY"
    "FIREBASE_ADMIN_CLIENT_EMAIL"
    "NEXT_PUBLIC_APP_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" .env.production; then
        print_error "Variável $var não encontrada no .env.production"
        exit 1
    fi
done

print_status "Configurações do Firebase verificadas!"

# Fazer build novamente
print_status "Fazendo build da aplicação..."
if npm run build; then
    print_status "✅ Build concluído com sucesso!"
    
    # Iniciar aplicação
    print_status "Iniciando aplicação..."
    pm2 start conexaogoias
    
    print_status "Configuração do Firebase corrigida! 🎉"
    print_info "Aplicação rodando com configurações corretas"
else
    print_error "Build falhou após correção das configurações"
    print_warning "Verifique os logs acima para detalhes do erro"
    exit 1
fi
