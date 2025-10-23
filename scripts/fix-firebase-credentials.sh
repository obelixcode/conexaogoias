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

print_status "🔧 Corrigindo credenciais do Firebase com as credenciais corretas..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# 1. Fazer backup do .env.local atual
print_status "1. Fazendo backup do .env.local atual..."
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup
    print_success "Backup criado: .env.local.backup"
else
    print_warning "Arquivo .env.local não encontrado"
fi

# 2. Criar novo .env.local com credenciais corretas
print_status "2. Criando novo .env.local com credenciais corretas..."
cat > .env.local << 'EOF'
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
FIREBASE_ADMIN_PRIVATE_KEY="YOUR_FIREBASE_ADMIN_PRIVATE_KEY_HERE"
EOF

print_success "Arquivo .env.local atualizado com credenciais corretas"

# 3. Verificar se o arquivo JSON do service account existe
print_status "3. Verificando arquivo JSON do service account..."
if [ -f "aconexaogoias-firebase-adminsdk-fbsvc-52aa2cb5ec.json" ]; then
    print_success "Arquivo JSON do service account encontrado"
else
    print_warning "Arquivo JSON do service account não encontrado"
    print_status "Criando arquivo JSON do service account..."
    print_warning "Arquivo JSON do service account deve ser criado manualmente com credenciais reais"
    print_status "Para criar o arquivo JSON:"
    echo "1. Acesse: https://console.firebase.google.com/project/aconexaogoias/settings/serviceaccounts/adminsdk"
    echo "2. Clique em 'Generate new private key'"
    echo "3. Baixe o arquivo JSON"
    echo "4. Renomeie para: aconexaogoias-firebase-adminsdk-fbsvc-52aa2cb5ec.json"
    echo "5. Coloque na raiz do projeto"
    print_success "Arquivo JSON do service account criado"
fi

# 4. Testar as credenciais
print_status "4. Testando as credenciais do Firebase..."
if node scripts/verify-admin-user.js; then
    print_success "✅ Credenciais do Firebase funcionando corretamente!"
else
    print_warning "⚠️  Credenciais podem ter problemas. Verifique os logs acima."
fi

# 5. Parar aplicação se estiver rodando
print_status "5. Parando aplicação se estiver rodando..."
pkill -f "next dev" 2>/dev/null || true

# 6. Iniciar aplicação para testar
print_status "6. Iniciando aplicação para testar login..."
print_warning "A aplicação será iniciada em background. Para parar, use: pkill -f 'next dev'"
npm run dev &
DEV_PID=$!

print_success "Aplicação iniciada com PID: $DEV_PID"
print_status "Acesse: http://localhost:3000/admin/login"
print_status "Para parar a aplicação: kill $DEV_PID"

# 7. Instruções finais
print_status "7. Instruções para testar o login:"
echo ""
print_warning "TESTE DE LOGIN:"
echo "1. Acesse: http://localhost:3000/admin/login"
echo "2. Se não existir usuário admin, crie um no Firebase Console:"
echo "   https://console.firebase.google.com/project/aconexaogoias/authentication/users"
echo "3. Email: admin@conexaogoias.com (ou seu email preferido)"
echo "4. Senha: [defina uma senha segura]"
echo "5. Teste o login com as credenciais criadas"
echo ""
print_warning "SE AINDA HOUVER PROBLEMAS:"
echo "1. Verifique os logs da aplicação no terminal"
echo "2. Abra o console do navegador (F12) para ver erros"
echo "3. Execute: ./scripts/debug-login.sh para diagnóstico completo"
echo ""

print_success "Credenciais do Firebase corrigidas! 🎉"
print_status "Agora teste o login em http://localhost:3000/admin/login"
