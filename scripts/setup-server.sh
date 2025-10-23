#!/bin/bash

# Script de configuração automática do servidor Ubuntu
# Para DigitalOcean

set -e

echo "🚀 Configurando servidor Ubuntu para Conexão Goiás..."

# ===== CONFIGURAÇÕES PARA EVITAR PROMPTS INTERATIVOS =====
echo "🔧 Configurando ambiente para instalação automática..."

# Configurar ambiente para não interromper
export DEBIAN_FRONTEND=noninteractive
export DEBIAN_PRIORITY=critical

# Configurar dpkg para não perguntar sobre conflitos
echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
echo 'debconf debconf/priority select critical' | debconf-set-selections

# Configurar openssh-server para não interromper
echo 'openssh-server openssh-server/permit-root-login select yes' | debconf-set-selections
echo 'openssh-server openssh-server/password-authentication select no' | debconf-set-selections

# Configurar nginx para não interromper
echo 'nginx nginx/enable_ssl select true' | debconf-set-selections

# Configurar certbot para não interromper
echo 'certbot certbot/install_cron select true' | debconf-set-selections

# Configurar ufw para não interromper
echo 'ufw ufw/enable select true' | debconf-set-selections

echo "✅ Ambiente configurado para instalação automática!"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para print colorido
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

print_status "Iniciando configuração do servidor..."

# 1. Atualizar sistema
print_status "Atualizando sistema..."
apt-get update
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade

# 2. Instalar dependências básicas
print_status "Instalando dependências básicas..."
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install curl wget git unzip software-properties-common htop

# 3. Instalar Node.js 20
print_status "Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install nodejs

# Verificar instalação
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js instalado: $NODE_VERSION"
print_status "NPM instalado: $NPM_VERSION"

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

# 8. Criar diretório da aplicação
print_status "Criando diretório da aplicação..."
mkdir -p /var/www/conexaogoias
cd /var/www/conexaogoias

# 9. Clonar repositório
print_status "Clonando repositório..."

# Verificar se o diretório já tem conteúdo
if [ "$(ls -A /var/www/conexaogoias)" ]; then
    print_warning "Diretório já existe com conteúdo. Fazendo backup..."
    mv /var/www/conexaogoias /var/www/conexaogoias.backup.$(date +%Y%m%d_%H%M%S)
    mkdir -p /var/www/conexaogoias
    cd /var/www/conexaogoias
fi

# Clonar repositório
git clone https://github.com/obelixcode/conexaogoias.git .

# 10. Instalar dependências
print_status "Instalando dependências da aplicação..."
npm install --legacy-peer-deps --no-optional --force

# 11. Criar arquivo de ambiente
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

# 12. Fazer build da aplicação
print_status "Fazendo build da aplicação..."

# Verificar se as variáveis de ambiente estão configuradas
if [ ! -f ".env.production" ]; then
    print_error "Arquivo .env.production não encontrado!"
    exit 1
fi

# Fazer build com verificação de erro
if ! npm run build; then
    print_error "Build falhou! Verificando logs..."
    print_warning "Possíveis causas:"
    print_warning "1. Variáveis de ambiente não configuradas"
    print_warning "2. Dependências faltando"
    print_warning "3. Erro de TypeScript"
    print_warning "4. Erro de ESLint"
    
    print_status "Tentando instalar dependências novamente..."
    npm install --legacy-peer-deps --no-optional
    
    print_status "Tentando build novamente..."
    npm run build
fi

# 13. Configurar PM2
print_status "Configurando PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 14. Configurar Nginx
print_status "Configurando Nginx..."
cat > /etc/nginx/sites-available/conexaogoias << 'EOF'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Main location
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
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/conexaogoias /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t
systemctl reload nginx

# 15. Configurar logrotate
print_status "Configurando logrotate..."
cat > /etc/logrotate.d/conexaogoias << 'EOF'
/var/www/conexaogoias/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF

# 16. Configurar usuário não-root
print_status "Configurando usuário deploy..."
if ! id "deploy" &>/dev/null; then
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
fi

# Dar permissões
chown -R deploy:deploy /var/www/conexaogoias

# 17. Criar script de deploy
print_status "Criando script de deploy..."
cat > /var/www/conexaogoias/deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando deploy do Conexão Goiás..."

# Ir para diretório da aplicação
cd /var/www/conexaogoias

# Parar aplicação
pm2 stop conexaogoias

# Fazer backup
if [ -d ".next" ]; then
    cp -r .next .next.backup.$(date +%Y%m%d_%H%M%S)
fi

# Atualizar código
git pull origin main

# Instalar dependências
npm install --legacy-peer-deps

# Fazer build
npm run build

# Iniciar aplicação
pm2 start conexaogoias

# Verificar status
pm2 status

echo "✅ Deploy concluído!"
EOF

chmod +x /var/www/conexaogoias/deploy.sh

# 18. Configurar cron para renovação SSL
print_status "Configurando renovação automática SSL..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# 19. Verificar status final
print_status "Verificando status final..."
pm2 status
systemctl status nginx

print_status "Configuração do servidor concluída!"
print_warning "Próximos passos:"
print_warning "1. Edite /var/www/conexaogoias/.env.production"
print_warning "2. Configure seu domínio no Nginx"
print_warning "3. Execute: certbot --nginx -d seu-dominio.com"
print_warning "4. Acesse: http://SEU_IP para testar"

echo ""
print_status "Comandos úteis:"
echo "  pm2 status          - Ver status da aplicação"
echo "  pm2 logs conexaogoias - Ver logs"
echo "  pm2 restart conexaogoias - Reiniciar aplicação"
echo "  nginx -t            - Testar configuração Nginx"
echo "  systemctl reload nginx - Recarregar Nginx"
echo ""
# 20. Limpeza final
print_status "Limpando configurações temporárias..."
# Restaurar configurações de ambiente para uso normal
unset DEBIAN_FRONTEND
unset DEBIAN_PRIORITY

print_status "Servidor configurado com sucesso! 🎉"
