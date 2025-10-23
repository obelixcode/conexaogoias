#!/bin/bash

# Script para configurar Firebase com credenciais reais
# Execute: ./scripts/setup-firebase-real.sh

set -e

echo "🔥 Configurando Firebase com credenciais reais..."

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

# Criar arquivo .env.production com credenciais reais
print_status "Configurando .env.production com credenciais reais do Firebase..."

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
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyUl3I0mJQ7KPY\nPe4fT15J4IMUswthouvozQxxbxKAnQfPBA7OYmz+frinTE7pBQY2wwyBRJ389v0l\nc2b2u6WhSkhCe9+6CKDGfwFrznkM9tP7rHtVJfXODvhts1YgQiQeg0G+mlI5uylE\n0w2SVMoqENpMsRc2hn5jVg74m23NbWRzxvqcqkdqtF31s1Umk+SEm3Y4unM12S6K\nnOsZdDuhVs0bbtWx4J0avsUJV2q/XUn4Ij5CfZCMzzp3DbXigd1K0WCvfKmNJlAr\nS/knNDG+UGCzkv2Bk0RF0H0OnxAZzdg+CwxZfoeTnWAye8IVatbXdx65lz7j2aLs\nvGqnJM2vAgMBAAECggEAWO6sGCYYY0yJcCR+t/3Aw+5k4TNkFzcGGW396SqgWyU1\nikB3U+WRfyDa3ZC4gA0B6ti+yU9bzZeua3mQ3bd65KQjwoh97Q01hZk8r7Pi+hy1\nXvxH7BDI9JHRwwAgEWl7Ev6aEMFtBZ66d7kcOSDxTCZogLwHHCnaKZd3UvRNQBgb\n088DU0Vm7i00SWWlpzOBanO7hA5lWMZm076eWSU0uk6FyEMR1bp6tO1vstUKSOUW\nMDdxe2URcrzyjWBtOOrmiqC6WYgrVcR4FuL8pCc/jekqXs2w7yrWHr9S0AEpj1Ym\nJEPsBE45pIX7SJqmA76EpbfPALICQIG9jYR2Vr1sFQKBgQDXnVJcp+V68AGLehdm\nPQNeIyzaY2ivMAcQJRdZaQo+WlMYkHzTKOxBJ4tTMoyD1WM4BR8Nh6oN7voMCcEG\nCDiZ6nFdKw33VteT4hryteGOFUzMONWaxMTNe3MjzGdzb9MRm9GK8uKuA9EAfRyL\np53/NLrA4wDKw0e6zZcurILvcwKBgQDTuNyhiooLv9CkAhbK9Wnv+WZyktOQ5B+j\nwzrOu7U/oEVuPYPLcWtguH/dcHKpHcshKVRcSI/ezlwL0xQfwZjpaqIqt3v2Ib21\n91t9FnCSxa3W/C+01qXHrPZH5z1QQSL25ODcAkLnpHyfEYh4Gturhn0HE/t7IxyU\ndw6NeGNh1QKBgE9VkaKKHIPZn5fkeouh04Vlx/ErNq+PKmokW60IWz6KGZ0mPOet\nXRC0Li2UoeM4NuO77qsZydaKofKf/CfuCnWHr+KqHt9tUrEVNvkrNy0CZVmXZ/Ek\niY1Z6Qm5Ai+Va8JE5RsNN57zxIk7f69bI2Vtz3F9lSMGK3RuhTwlOaBFAoGANkK+\naLg0wOYb9qyCYumaiOIGG379sbiFU1cJj0oUHYZZxPMG//DFcDhYrMvQ1v7HvGv3\nLt9538RLWsxx7+GR6uBlR0VXA7GKCUSnsds6ZqM69koTf+ky+4WcaLkewZ6v806d\nQkViGDPTrIC11PItMjx5doLshJZvEK2ikSc1cTECgYEA0XAHWkqhx7gp6UrV0vcm\ngG1eds4zVp37vWuekekKF0KKDUoa8wewzL+ZSiMZUDRX8j8L2i9fOZjBF0Nc59Tx\nZEuOoTtcL4aU4Ga90TJhT2oZbLhUQ70o+UFPN4Wn1Rm8uDL7VFXf3+zkcGVaGOj3\ntHhW977M1UyugdHFkIRCwfw=\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aconexaogoias.iam.gserviceaccount.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
EOF

print_status "Arquivo .env.production configurado com credenciais reais!"

# Verificar se as configurações estão corretas
print_status "Verificando configurações..."

# Verificar se não tem mais "your_project_id"
if grep -q "your_project_id" .env.production; then
    print_error "Ainda há configurações de exemplo no arquivo!"
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
    
    print_status "Firebase configurado com credenciais reais! 🎉"
    print_info "Aplicação rodando com configurações corretas"
    print_warning "⚠️  Lembre-se de atualizar NEXT_PUBLIC_APP_URL com a URL real do seu servidor"
else
    print_error "Build falhou após configuração do Firebase"
    print_warning "Verifique os logs acima para detalhes do erro"
    exit 1
fi
