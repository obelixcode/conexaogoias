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

print_status "🔧 Criando arquivo .env.production com credenciais corretas..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# Fazer backup se existir
if [ -f ".env.production" ]; then
    print_status "Fazendo backup do .env.production existente..."
    cp .env.production .env.production.backup
    print_success "Backup criado: .env.production.backup"
fi

# Criar .env.production com credenciais corretas
print_status "Criando .env.production com credenciais corretas..."
cat > .env.production << 'EOF'
# Firebase Client (Public) - Credenciais Corretas
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742

# App URL - Configure com seu domínio de produção
NEXT_PUBLIC_APP_URL=https://conexaogoias.com

# Firebase Admin SDK - Credenciais Corretas do arquivo JSON
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aconexaogoias.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyUl3I0mJQ7KPY\nPe4fT15J4IMUswthouvozQxxbxKAnQfPBA7OYmz+frinTE7pBQY2wwyBRJ389v0l\nc2b2u6WhSkhCe9+6CKDGfwFrznkM9tP7rHtVJfXODvhts1YgQiQeg0G+mlI5uylE\n0w2SVMoqENpMsRc2hn5jVg74m23NbWRzxvqcqkdqtF31s1Umk+SEm3Y4unM12S6K\nnOsZdDuhVs0bbtWx4J0avsUJV2q/XUn4Ij5CfZCMzzp3DbXigd1K0WCvfKmNJlAr\nS/knNDG+UGCzkv2Bk0RF0H0OnxAZzdg+CwxZfoeTnWAye8IVatbXdx65lz7j2aLs\nvGqnJM2vAgMBAAECggEAWO6sGCYYY0yJcCR+t/3Aw+5k4TNkFzcGGW396SqgWyU1\nikB3U+WRfyDa3ZC4gA0B6ti+yU9bzZeua3mQ3bd65KQjwoh97Q01hZk8r7Pi+hy1\nXvxH7BDI9JHRwwAgEWl7Ev6aEMFtBZ66d7kcOSDxTCZogLwHHCnaKZd3UvRNQBgb\n088DU0Vm7i00SWWlpzOBanO7hA5lWMZm076eWSU0uk6FyEMR1bp6tO1vstUKSOUW\nMDdxe2URcrzyjWBtOOrmiqC6WYgrVcR4FuL8pCc/jekqXs2w7yrWHr9S0AEpj1Ym\nJEPsBE45pIX7SJqmA76EpbfPALICQIG9jYR2Vr1sFQKBgQDXnVJcp+V68AGLehdm\nPQNeIyzaY2ivMAcQJRdZaQo+WlMYHzTKOxBJ4tTMoyD1WM4BR8Nh6oN7voMCcEG\nCDiZ6nFdKw33VteT4hryteGOFUzMONWaxMTNe3MjzGdzb9MRm9GK8uKuA9EAfRyL\np53/NLrA4wDKw0e6zZcurILvcwKBgQDTuNyhiooLv9CkAhbK9Wnv+WZyktOQ5B+j\nwzrOu7U/oEVuPYPLcWtguH/dcHKpHcshKVRcSI/ezlwL0xQfwZjpaqIqt3v2Ib21\n91t9FnCSxa3W/C+01qXHrPZH5z1QQSL25ODcAkLnpHyfEYh4Gturhn0HE/t7IxyU\ndw6NeGNh1QKBgE9VkaKKHIPZn5fkeouh04Vlx/ErNq+PKmokW60IWz6KGZ0mPOet\nXRC0Li2UoeM4NuO77qsZydaKofKf/CfuCnWHr+KqHt9tUrEVNvkrNy0CZVmXZ/Ek\niY1Z6Qm5Ai+Va8JE5RsNN57zxIk7f69bI2Vtz3F9lSMGK3RuhTwlOaBFAoGANkK+\naLg0wOYb9qyCYumaiOIGG379sbiFU1cJj0oUHYZZxPMG//DFcDhYrMvQ1v7HvGv3\nLt9538RLWsxx7+GR6uBlR0VXA7GKCUSnsds6ZqM69koTf+ky+4WcaLkewZ6v806d\nQkViGDPTrIC11PItMjx5doLshJZvEK2ikSc1cTECgYEA0XAHWkqhx7gp6UrV0vcm\ngG1eds4zVp37vWuekekKF0KKDUoa8wewzL+ZSiMZUDRX8j8L2i9fOZjBF0Nc59Tx\nZEuOoTtcL4aU4Ga90TJhT2oZbLhUQ70o+UFPN4Wn1Rm8uDL7VFXf3+zkcGVaGOj3\ntHhW977M1UyugdHFkIRCwfw=\n-----END PRIVATE KEY-----\n"

# Environment
NODE_ENV=production
EOF

print_success "Arquivo .env.production criado com credenciais corretas!"

# Verificar se o arquivo foi criado corretamente
if [ -f ".env.production" ]; then
    print_status "Verificando arquivo .env.production..."
    
    # Verificar se as variáveis críticas estão presentes
    if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY=" .env.production && \
       grep -q "FIREBASE_ADMIN_PROJECT_ID=" .env.production && \
       grep -q "FIREBASE_ADMIN_PRIVATE_KEY=" .env.production; then
        print_success "✅ Arquivo .env.production criado com sucesso!"
        print_status "Variáveis críticas encontradas:"
        echo "  - NEXT_PUBLIC_FIREBASE_API_KEY: ✅"
        echo "  - FIREBASE_ADMIN_PROJECT_ID: ✅"
        echo "  - FIREBASE_ADMIN_PRIVATE_KEY: ✅"
        echo "  - NEXT_PUBLIC_APP_URL: ✅"
    else
        print_error "❌ Arquivo .env.production não foi criado corretamente"
        exit 1
    fi
else
    print_error "❌ Falha ao criar arquivo .env.production"
    exit 1
fi

print_status "Instruções de uso:"
echo ""
print_warning "CONFIGURAÇÃO ADICIONAL:"
echo "1. Verifique se NEXT_PUBLIC_APP_URL está correto para seu domínio"
echo "2. Se necessário, ajuste a URL para seu domínio de produção"
echo "3. O arquivo está pronto para uso em produção"
echo ""
print_warning "PARA TESTAR:"
echo "1. Execute: npm run build"
echo "2. Execute: npm start"
echo "3. Acesse: http://localhost:3000/admin/login"
echo ""

print_success "Arquivo .env.production criado com credenciais corretas! 🎉"
