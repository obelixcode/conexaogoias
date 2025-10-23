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
    cat > aconexaogoias-firebase-adminsdk-fbsvc-52aa2cb5ec.json << 'EOF'
{
  "type": "service_account",
  "project_id": "aconexaogoias",
  "private_key_id": "52aa2cb5ec8a752ccc1bbb6fdf64d54637edb50d",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyUl3I0mJQ7KPY\nPe4fT15J4IMUswthouvozQxxbxKAnQfPBA7OYmz+frinTE7pBQY2wwyBRJ389v0l\nc2b2u6WhSkhCe9+6CKDGfwFrznkM9tP7rHtVJfXODvhts1YgQiQeg0G+mlI5uylE\n0w2SVMoqENpMsRc2hn5jVg74m23NbWRzxvqcqkdqtF31s1Umk+SEm3Y4unM12S6K\nnOsZdDuhVs0bbtWx4J0avsUJV2q/XUn4Ij5CfZCMzzp3DbXigd1K0WCvfKmNJlAr\nS/knNDG+UGCzkv2Bk0RF0H0OnxAZzdg+CwxZfoeTnWAye8IVatbXdx65lz7j2aLs\nvGqnJM2vAgMBAAECggEAWO6sGCYYY0yJcCR+t/3Aw+5k4TNkFzcGGW396SqgWyU1\nikB3U+WRfyDa3ZC4gA0B6ti+yU9bzZeua3mQ3bd65KQjwoh97Q01hZk8r7Pi+hy1\nXvxH7BDI9JHRwwAgEWl7Ev6aEMFtBZ66d7kcOSDxTCZogLwHHCnaKZd3UvRNQBgb\n088DU0Vm7i00SWWlpzOBanO7hA5lWMZm076eWSU0uk6FyEMR1bp6tO1vstUKSOUW\nMDdxe2URcrzyjWBtOOrmiqC6WYgrVcR4FuL8pCc/jekqXs2w7yrWHr9S0AEpj1Ym\nJEPsBE45pIX7SJqmA76EpbfPALICQIG9jYR2Vr1sFQKBgQDXnVJcp+V68AGLehdm\nPQNeIyzaY2ivMAcQJRdZaQo+WlMYHzTKOxBJ4tTMoyD1WM4BR8Nh6oN7voMCcEG\nCDiZ6nFdKw33VteT4hryteGOFUzMONWaxMTNe3MjzGdzb9MRm9GK8uKuA9EAfRyL\np53/NLrA4wDKw0e6zZcurILvcwKBgQDTuNyhiooLv9CkAhbK9Wnv+WZyktOQ5B+j\nwzrOu7U/oEVuPYPLcWtguH/dcHKpHcshKVRcSI/ezlwL0xQfwZjpaqIqt3v2Ib21\n91t9FnCSxa3W/C+01qXHrPZH5z1QQSL25ODcAkLnpHyfEYh4Gturhn0HE/t7IxyU\ndw6NeGNh1QKBgE9VkaKKHIPZn5fkeouh04Vlx/ErNq+PKmokW60IWz6KGZ0mPOet\nXRC0Li2UoeM4NuO77qsZydaKofKf/CfuCnWHr+KqHt9tUrEVNvkrNy0CZVmXZ/Ek\niY1Z6Qm5Ai+Va8JE5RsNN57zxIk7f69bI2Vtz3F9lSMGK3RuhTwlOaBFAoGANkK+\naLg0wOYb9qyCYumaiOIGG379sbiFU1cJj0oUHYZZxPMG//DFcDhYrMvQ1v7HvGv3\nLt9538RLWsxx7+GR6uBlR0VXA7GKCUSnsds6ZqM69koTf+ky+4WcaLkewZ6v806d\nQkViGDPTrIC11PItMjx5doLshJZvEK2ikSc1cTECgYEA0XAHWkqhx7gp6UrV0vcm\ngG1eds4zVp37vWuekekKF0KKDUoa8wewzL+ZSiMZUDRX8j8L2i9fOZjBF0Nc59Tx\nZEuOoTtcL4aU4Ga90TJhT2oZbLhUQ70o+UFPN4Wn1Rm8uDL7VFXf3+zkcGVaGOj3\ntHhW977M1UyugdHFkIRCwfw=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@aconexaogoias.iam.gserviceaccount.com",
  "client_id": "108017490064709487546",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40aconexaogoias.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
EOF
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
