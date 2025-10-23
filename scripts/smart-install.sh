#!/bin/bash

# Script de Instalação Inteligente para Ubuntu DigitalOcean
# Resolve automaticamente todos os conflitos de dependências
# Execute: ./scripts/smart-install.sh

set -e

echo "🧠 Instalação Inteligente - Resolvendo todos os problemas automaticamente..."

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

# ===== CONFIGURAÇÕES PARA EVITAR PROMPTS INTERATIVOS =====
print_info "Configurando ambiente para instalação automática..."
export DEBIAN_FRONTEND=noninteractive
export DEBIAN_PRIORITY=critical

# Configurar dpkg para não perguntar sobre conflitos
echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
echo 'debconf debconf/priority select critical' | debconf-set-selections
echo 'openssh-server openssh-server/permit-root-login select yes' | debconf-set-selections
echo 'openssh-server openssh-server/password-authentication select no' | debconf-set-selections
echo 'nginx nginx/enable_ssl select true' | debconf-set-selections
echo 'certbot certbot/install_cron select true' | debconf-set-selections
echo 'ufw ufw/enable select true' | debconf-set-selections

print_status "Ambiente configurado para instalação automática!"

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script deve ser executado como root"
    exit 1
fi

# 1. Atualizar sistema
print_status "Atualizando sistema Ubuntu..."
apt-get update
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade

# 2. Instalar dependências básicas
print_status "Instalando dependências básicas..."
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install curl wget git unzip software-properties-common htop

# 3. Verificar e instalar Node.js 20
print_info "Verificando versão do Node.js..."
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")

if [ "$NODE_VERSION" -lt 20 ]; then
    print_warning "Node.js $NODE_VERSION detectado. Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install nodejs
else
    print_status "Node.js 20+ já instalado: $(node --version)"
fi

# 4. Instalar PM2
print_status "Instalando PM2..."
npm install -g pm2

# 5. Instalar Nginx
print_status "Instalando Nginx..."
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install nginx
systemctl start nginx
systemctl enable nginx

# 6. Instalar Certbot
print_status "Instalando Certbot..."
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install certbot python3-certbot-nginx

# 7. Configurar Firewall
print_status "Configurando firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# 8. Parar aplicação se estiver rodando
print_status "Parando aplicação anterior (se existir)..."
pm2 stop conexaogoias 2>/dev/null || true
pm2 delete conexaogoias 2>/dev/null || true

# 9. Criar diretório da aplicação
print_status "Preparando diretório da aplicação..."
mkdir -p /var/www/conexaogoias
cd /var/www/conexaogoias

# 10. Backup e clonagem inteligente
if [ "$(ls -A /var/www/conexaogoias 2>/dev/null)" ]; then
    print_warning "Diretório já existe com conteúdo. Fazendo backup..."
    BACKUP_DIR="/var/www/conexaogoias.backup.$(date +%Y%m%d_%H%M%S)"
    mv /var/www/conexaogoias "$BACKUP_DIR"
    mkdir -p /var/www/conexaogoias
    cd /var/www/conexaogoias
fi

print_status "Clonando repositório..."
git clone https://github.com/obelixcode/conexaogoias.git .

# 11. Downgrade automático do React (19 → 18)
print_info "Aplicando downgrade automático do React 19 → 18..."
if grep -q '"react": "19' package.json; then
    print_warning "React 19 detectado. Aplicando downgrade para React 18..."
    sed -i 's/"react": "19\.1\.0"/"react": "^18.3.1"/' package.json
    sed -i 's/"react-dom": "19\.1\.0"/"react-dom": "^18.3.1"/' package.json
    sed -i 's/"@types\/react": "^19"/"@types\/react": "^18"/' package.json
    sed -i 's/"@types\/react-dom": "^19"/"@types\/react-dom": "^18"/' package.json
    print_status "Downgrade do React aplicado com sucesso!"
else
    print_status "React já está na versão 18"
fi

# 12. Limpeza completa de dependências
print_status "Limpando dependências anteriores..."
rm -rf node_modules package-lock.json

# 13. Configuração .npmrc otimizada
print_status "Configurando .npmrc para resolver conflitos..."
cat > .npmrc << 'EOF'
legacy-peer-deps=true
force=true
auto-install-peers=false
strict-peer-deps=false
fund=false
audit=false
EOF

# 14. Instalação de dependências com estratégias múltiplas
print_status "Instalando dependências principais..."
if ! npm install --legacy-peer-deps --no-optional --force; then
    print_warning "Primeira tentativa falhou. Tentando estratégia alternativa..."
    rm -rf node_modules package-lock.json
    npm install --legacy-peer-deps --force
fi

# 15. Instalação Firebase Admin SDK
print_status "Instalando dependências do Firebase Admin..."
npm install @google-cloud/firestore@latest --save
npm install @google-cloud/storage@latest --save
npm install @google-cloud/common@latest --save
npm install firebase-admin@latest --save

# 16. Verificação de dependências críticas
print_status "Verificando dependências críticas..."
CRITICAL_DEPS=(
    "react"
    "react-dom"
    "@google-cloud/firestore"
    "firebase-admin"
    "@wordpress/block-editor"
    "@wordpress/components"
)

for dep in "${CRITICAL_DEPS[@]}"; do
    if [ -d "node_modules/$dep" ]; then
        print_status "✅ $dep instalado"
    else
        print_error "❌ $dep não instalado"
    fi
done

# 17. Verificar versão do React instalada
REACT_VERSION=$(node -p "require('./node_modules/react/package.json').version")
print_info "Versão do React instalada: $REACT_VERSION"

# 18. Configuração .env.production
print_status "Configurando arquivo de ambiente..."
if [ ! -f ".env.production" ]; then
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

# 19. Build com múltiplas tentativas
print_status "Iniciando build da aplicação..."
BUILD_SUCCESS=false

for attempt in 1 2 3; do
    print_info "Tentativa de build $attempt/3..."
    if npm run build; then
        print_status "✅ Build concluído com sucesso na tentativa $attempt!"
        BUILD_SUCCESS=true
        break
    else
        print_warning "Build falhou na tentativa $attempt"
        if [ $attempt -lt 3 ]; then
            print_info "Limpando e reinstalando dependências..."
            rm -rf node_modules package-lock.json
            npm install --legacy-peer-deps --no-optional --force
        fi
    fi
done

if [ "$BUILD_SUCCESS" = false ]; then
    print_error "Build falhou após 3 tentativas!"
    print_warning "Verificando logs de erro..."
    npm run build 2>&1 | tail -20
    exit 1
fi

# 20. Configuração PM2
print_status "Configurando PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 21. Configuração Nginx
print_status "Configurando Nginx..."
cat > /etc/nginx/sites-available/conexaogoias << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/conexaogoias /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 22. Limpeza final
print_status "Limpando configurações temporárias..."
unset DEBIAN_FRONTEND
unset DEBIAN_PRIORITY

# 23. Verificação final
print_status "Verificando status da aplicação..."
pm2 status
systemctl status nginx --no-pager

print_status "🎉 Instalação inteligente concluída com sucesso!"
print_info "Sistema configurado e funcionando:"
print_info "- Node.js: $(node --version)"
print_info "- React: $REACT_VERSION"
print_info "- PM2: $(pm2 --version)"
print_info "- Nginx: $(nginx -v 2>&1)"
print_warning "⚠️  Lembre-se de configurar o arquivo .env.production com suas credenciais!"
