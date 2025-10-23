#!/bin/bash

# Script para limpeza e reinstalação
# Execute: ./scripts/clean-install.sh

set -e

echo "🧹 Limpando instalação anterior e reinstalando..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script deve ser executado como root"
    exit 1
fi

# Parar aplicação se estiver rodando
print_status "Parando aplicação..."
pm2 stop conexaogoias 2>/dev/null || true
pm2 delete conexaogoias 2>/dev/null || true

# Fazer backup do diretório atual
if [ -d "/var/www/conexaogoias" ]; then
    print_status "Fazendo backup da instalação anterior..."
    mv /var/www/conexaogoias /var/www/conexaogoias.backup.$(date +%Y%m%d_%H%M%S)
fi

# Criar novo diretório
print_status "Criando novo diretório..."
mkdir -p /var/www/conexaogoias
cd /var/www/conexaogoias

# Clonar repositório
print_status "Clonando repositório..."
git clone https://github.com/obelixcode/conexaogoias.git .

# Instalar dependências
print_status "Instalando dependências..."
npm install --legacy-peer-deps --no-optional

# Criar arquivo de ambiente
print_status "Criando arquivo de ambiente..."
cat > .env.production << 'EOF'
# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742

# App Configuration
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NEXT_PUBLIC_APP_NAME="Conexão Goiás"

# Firebase Admin (Production)
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aconexaogoias.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[SUA_CHAVE_PRIVADA_AQUI]\n-----END PRIVATE KEY-----\n"

# Node Environment
NODE_ENV=production
PORT=3000
EOF

print_warning "IMPORTANTE: Edite o arquivo .env.production com suas configurações!"
print_warning "Especialmente: NEXT_PUBLIC_APP_URL e FIREBASE_ADMIN_PRIVATE_KEY"

# Fazer build
print_status "Fazendo build da aplicação..."
if [ -f "scripts/build-app.sh" ]; then
    chmod +x scripts/build-app.sh
    ./scripts/build-app.sh
else
    npm run build
fi

# Configurar PM2
print_status "Configurando PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Verificar status
print_status "Verificando status..."
pm2 status

print_status "Limpeza e reinstalação concluída! 🎉"
print_warning "Próximos passos:"
print_warning "1. Edite /var/www/conexaogoias/.env.production"
print_warning "2. Configure seu domínio no Nginx"
print_warning "3. Execute: certbot --nginx -d seu-dominio.com"
print_warning "4. Acesse: http://SEU_IP para testar"
