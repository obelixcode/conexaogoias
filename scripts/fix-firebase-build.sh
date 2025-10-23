#!/bin/bash

# Script para corrigir problemas de build do Firebase
# Execute: ./scripts/fix-firebase-build.sh

set -e

echo "🔧 Corrigindo problemas de build do Firebase..."

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

# Instalar dependências principais
print_status "Instalando dependências principais..."
npm install --legacy-peer-deps --no-optional --force

# Instalar dependências específicas do Firebase Admin
print_status "Instalando dependências do Firebase Admin..."
npm install @google-cloud/firestore@latest --save
npm install @google-cloud/storage@latest --save
npm install @google-cloud/common@latest --save
npm install firebase-admin@latest --save

# Verificar se as dependências foram instaladas
print_status "Verificando dependências do Firebase..."
if [ -d "node_modules/@google-cloud/firestore" ]; then
    print_status "✅ @google-cloud/firestore instalado"
else
    print_error "❌ @google-cloud/firestore não instalado"
fi

if [ -d "node_modules/firebase-admin" ]; then
    print_status "✅ firebase-admin instalado"
else
    print_error "❌ firebase-admin não instalado"
fi

# Verificar se o arquivo .env.production existe
if [ ! -f ".env.production" ]; then
    print_warning "Arquivo .env.production não encontrado!"
    print_status "Criando arquivo .env.production..."
    cat > .env.production << 'EOF'
# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
EOF
    print_warning "⚠️  IMPORTANTE: Edite o arquivo .env.production com suas configurações!"
    print_warning "⚠️  Especialmente: NEXT_PUBLIC_APP_URL e FIREBASE_ADMIN_PRIVATE_KEY"
fi

# Tentar build
print_status "Tentando build..."
if npm run build; then
    print_status "✅ Build concluído com sucesso!"
    
    # Iniciar aplicação
    print_status "Iniciando aplicação..."
    pm2 start conexaogoias
    
    print_status "Problemas de build do Firebase resolvidos! 🎉"
else
    print_error "Build ainda falhou. Verificando logs..."
    
    # Mostrar logs de erro
    print_warning "Logs de erro:"
    npm run build 2>&1 | tail -20
    
    print_warning "Possíveis soluções:"
    print_warning "1. Verificar se todas as dependências foram instaladas"
    print_warning "2. Verificar variáveis de ambiente"
    print_warning "3. Verificar se o Firebase está configurado corretamente"
    print_warning "4. Verificar se as chaves do Firebase estão corretas"
fi
