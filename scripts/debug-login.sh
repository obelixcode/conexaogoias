#!/bin/bash
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🔍 Iniciando diagnóstico de problemas de login..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# 1. Verificar arquivo .env.production
print_status "1. Verificando arquivo .env.production..."
if [ ! -f ".env.production" ]; then
    print_error "Arquivo .env.production não encontrado!"
    print_warning "Crie o arquivo .env.production com as configurações do Firebase"
    exit 1
fi

# Verificar variáveis críticas
print_status "2. Verificando variáveis de ambiente críticas..."
MISSING_VARS=()

if ! grep -q "NEXT_PUBLIC_FIREBASE_API_KEY=" .env.production || [ -z "$(grep 'NEXT_PUBLIC_FIREBASE_API_KEY=' .env.production | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("NEXT_PUBLIC_FIREBASE_API_KEY")
fi

if ! grep -q "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=" .env.production || [ -z "$(grep 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=' .env.production | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")
fi

if ! grep -q "NEXT_PUBLIC_FIREBASE_PROJECT_ID=" .env.production || [ -z "$(grep 'NEXT_PUBLIC_FIREBASE_PROJECT_ID=' .env.production | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("NEXT_PUBLIC_FIREBASE_PROJECT_ID")
fi

if ! grep -q "FIREBASE_ADMIN_PROJECT_ID=" .env.production || [ -z "$(grep 'FIREBASE_ADMIN_PROJECT_ID=' .env.production | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("FIREBASE_ADMIN_PROJECT_ID")
fi

if ! grep -q "FIREBASE_ADMIN_CLIENT_EMAIL=" .env.production || [ -z "$(grep 'FIREBASE_ADMIN_CLIENT_EMAIL=' .env.production | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("FIREBASE_ADMIN_CLIENT_EMAIL")
fi

if ! grep -q "FIREBASE_ADMIN_PRIVATE_KEY=" .env.production || [ -z "$(grep 'FIREBASE_ADMIN_PRIVATE_KEY=' .env.production | cut -d'=' -f2)" ]; then
    MISSING_VARS+=("FIREBASE_ADMIN_PRIVATE_KEY")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "Variáveis de ambiente faltando: ${MISSING_VARS[*]}"
    print_warning "Configure essas variáveis no arquivo .env.production"
    exit 1
fi

print_success "Todas as variáveis de ambiente estão configuradas"

# 3. Verificar se o usuário existe no Firestore
print_status "3. Verificando se o usuário admin existe no Firestore..."
print_warning "Para verificar se o usuário existe, você precisa:"
print_warning "1. Acessar o Firebase Console (https://console.firebase.google.com)"
print_warning "2. Ir em Firestore Database"
print_warning "3. Verificar se existe uma coleção 'users' com um documento do seu usuário"
print_warning "4. O documento deve ter os campos: email, name, role, isActive"

# 4. Verificar regras do Firestore
print_status "4. Verificando regras do Firestore..."
if [ -f "firestore.rules" ]; then
    print_status "Arquivo firestore.rules encontrado"
    if grep -q "allow read, write: if true;" firestore.rules; then
        print_warning "Regras do Firestore estão permissivas (desenvolvimento)"
    else
        print_warning "Regras do Firestore podem estar restritivas"
        print_status "Para desenvolvimento, você pode usar: allow read, write: if true;"
    fi
else
    print_error "Arquivo firestore.rules não encontrado"
fi

# 5. Testar configuração do Firebase
print_status "5. Testando configuração do Firebase..."
print_status "Iniciando aplicação em modo de desenvolvimento para testar login..."

# Parar PM2 se estiver rodando
pm2 stop conexaogoias 2>/dev/null || true
pm2 delete conexaogoias 2>/dev/null || true

# Iniciar em modo desenvolvimento
print_status "Iniciando aplicação com npm run dev..."
print_warning "Acesse http://localhost:3000/admin/login para testar o login"
print_warning "Verifique o console do navegador (F12) para ver os logs de autenticação"
print_warning "Verifique também os logs do terminal para erros do Firebase"

# Iniciar em background
npm run dev &
DEV_PID=$!

print_status "Aplicação iniciada com PID: $DEV_PID"
print_status "Para parar a aplicação, execute: kill $DEV_PID"

# 6. Instruções de diagnóstico
print_status "6. Instruções para diagnóstico completo:"
echo ""
print_warning "DIAGNÓSTICO MANUAL:"
echo "1. Acesse http://localhost:3000/admin/login"
echo "2. Abra o console do navegador (F12 → Console)"
echo "3. Tente fazer login com suas credenciais"
echo "4. Observe os logs no console do navegador"
echo "5. Observe os logs no terminal"
echo ""
print_warning "LOGS IMPORTANTES A OBSERVAR:"
echo "- '🔐 Tentando fazer login com: [email]'"
echo "- '🔧 Configurações do Firebase: ...'"
echo "- '✅ Usuário autenticado no Firebase Auth: [uid]'"
echo "- '✅ Dados do usuário encontrados: ...'"
echo "- Qualquer erro com código 'auth/...'"
echo ""
print_warning "PROBLEMAS COMUNS:"
echo "1. auth/invalid-credential: Email ou senha incorretos"
echo "2. auth/user-not-found: Usuário não existe no Firebase Auth"
echo "3. auth/wrong-password: Senha incorreta"
echo "4. auth/invalid-api-key: Chave da API inválida"
echo "5. auth/project-not-found: Projeto não encontrado"
echo "6. PERMISSION_DENIED: Regras do Firestore muito restritivas"
echo ""
print_warning "SOLUÇÕES:"
echo "1. Verifique se o usuário existe no Firebase Console"
echo "2. Verifique se as credenciais estão corretas"
echo "3. Verifique se as regras do Firestore permitem leitura/escrita"
echo "4. Verifique se as variáveis de ambiente estão corretas"
echo ""

print_success "Diagnóstico iniciado! Verifique os logs acima para identificar o problema."
