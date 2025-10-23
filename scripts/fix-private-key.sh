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

print_status "🔑 Corrigindo chave privada do Firebase Admin SDK..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# Verificar se o arquivo JSON existe
if [ ! -f "aconexaogoias-firebase-adminsdk-fbsvc-52aa2cb5ec.json" ]; then
    print_error "Arquivo JSON do service account não encontrado!"
    exit 1
fi

# Extrair a chave privada do arquivo JSON
print_status "1. Extraindo chave privada do arquivo JSON..."
PRIVATE_KEY=$(node -e "
const fs = require('fs');
const json = JSON.parse(fs.readFileSync('aconexaogoias-firebase-adminsdk-fbsvc-52aa2cb5ec.json', 'utf8'));
console.log(json.private_key);
")

if [ -z "$PRIVATE_KEY" ]; then
    print_error "Não foi possível extrair a chave privada do arquivo JSON"
    exit 1
fi

print_success "Chave privada extraída com sucesso"

# Atualizar o .env.local com a chave privada correta
print_status "2. Atualizando .env.local com a chave privada correta..."

# Fazer backup
cp .env.local .env.local.backup2

# Atualizar apenas a chave privada
cat > .env.local << EOF
# Firebase Client (Public) - Credenciais Corretas
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Admin SDK - Credenciais Corretas do arquivo JSON
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aconexaogoias.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="$PRIVATE_KEY"
EOF

print_success "Arquivo .env.local atualizado com chave privada correta"

# Testar as credenciais
print_status "3. Testando as credenciais corrigidas..."
if node scripts/verify-admin-user.js; then
    print_success "✅ Credenciais do Firebase funcionando corretamente!"
else
    print_warning "⚠️  Ainda há problemas com as credenciais. Verifique os logs acima."
fi

print_success "Chave privada corrigida! 🎉"
print_status "Agora teste o login em http://localhost:3000/admin/login"
