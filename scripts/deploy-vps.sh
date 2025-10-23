#!/bin/bash

# Script para deploy na VPS
# Uso: ./scripts/deploy-vps.sh

VPS_IP="146.190.174.106"
VPS_USER="root"
VPS_PASSWORD="1S5Yy9if2x"

echo "🚀 DEPLOY VPS - CONEXÃO GOIÁS"
echo "=============================="

echo "1. Conectando na VPS e fazendo deploy..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" << 'EOF'
echo "📁 Navegando para o diretório da aplicação..."
cd /root/conexaogoias || { echo "❌ Diretório não encontrado"; exit 1; }

echo "🔄 Fazendo pull das mudanças..."
git pull origin main

echo "📦 Instalando dependências..."
npm install

echo "🔧 Configurando variáveis de ambiente..."
if [ ! -f ".env.production" ]; then
    echo "📝 Criando .env.production..."
    cat > .env.production << 'ENVEOF'
# Firebase Configuration (Public) - PRODUÇÃO
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742

# Firebase Admin Configuration - PRODUÇÃO
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyUl3I0mJQ7KPY\nPe4fT15J4IMUswthouvozQxxbxKAnQfPBA7OYmz+frinTE7pBQY2wwyBRJ389v0l\nc2b2u6WhSkhCe9+6CKDGfwFrznkM9tP7rHtVJfXODvhts1YgQiQeg0G+mlI5uylE\n0w2SVMoqENpMsRc2hn5jVg74m23NbWRzxvqcqkdqtF31s1Umk+SEm3Y4unM12S6K\nnOsZdDuhVs0bbtWx4J0avsUJV2q/XUn4Ij5CfZCMzzp3DbXigd1K0WCvfKmNJlAr\nS/knNDG+UGCzkv2Bk0RF0H0OnxAZzdg+CwxZfoeTnWAye8IVatbXdx65lz7j2aLs\nvGqnJM2vAgMBAAECggEAWO6sGCYYY0yJcCR+t/3Aw+5k4TNkFzcGGW396SqgWyU1\nikB3U+WRfyDa3ZC4gA0B6ti+yU9bzZeua3mQ3bd65KQjwoh97Q01hZk8r7Pi+hy1\nXvxH7BDI9JHRwwAgEWl7Ev6aEMFtBZ66d7kcOSDxTCZogLwHHCnaKZd3UvRNQBgb\n088DU0Vm7i00SWWlpzOBanO7hA5lWMZm076eWSU0uk6FyEMR1bp6tO1vstUKSOUW\nMDdxe2URcrzyjWBtOOrmiqC6WYgrVcR4FuL8pCc/jekqXs2w7yrWHr9S0AEpj1Ym\nJEPsBE45pIX7SJqmA76EpbfPALICQIG9jYR2Vr1sFQKBgQDXnVJcp+V68AGLehdm\nPQNeIyzaY2ivMAcQJRdZaQo+WlMYkHzTKOxBJ4tTMoyD1WM4BR8Nh6oN7voMCcEG\nCDiZ6nFdKw33VteT4hryteGOFUzMONWaxMTNe3MjzGdzb9MRm9GK8uKuA9EAfRyL\np53/NLrA4wDKw0e6zZcurILvcwKBgQDTuNyhiooLv9CkAhbK9Wnv+WZyktOQ5B+j\nwzrOu7U/oEVuPYPLcWtguH/dcHKpHcshKVRcSI/ezlwL0xQfwZjpaqIqt3v2Ib21\n91t9FnCSxa3W/C+01qXHrPZH5z1QQSL25ODcAkLnpHyfEYh4Gturhn0HE/t7IxyU\ndw6NeGNh1QKBgE9VkaKKHIPZn5fkeouh04Vlx/ErNq+PKmokW60IWz6KGZ0mPOet\nXRC0Li2UoeM4NuO77qsZydaKofKf/CfuCnWHr+KqHt9tUrEVNvkrNy0CZVmXZ/Ek\niY1Z6Qm5Ai+Va8JE5RsNN57zxIk7f69bI2Vtz3F9lSMGK3RuhTwlOaBFAoGANkK+\naLg0wOYb9qyCYumaiOIGG379sbiFU1cJj0oUHYZZxPMG//DFcDhYrMvQ1v7HvGv3\nLt9538RLWsxx7+GR6uBlR0VXA7GKCUSnsds6ZqM69koTf+ky+4WcaLkewZ6v806d\nQkViGDPTrIC11PItMjx5doLshJZvEK2ikSc1cTECgYEA0XAHWkqhx7gp6UrV0vcm\ngG1eds4zVp37vWuekekKF0KKDUoa8wewzL+ZSiMZUDRX8j8L2i9fOZjBF0Nc59Tx\nZEuOoTtcL4aU4Ga90TJhT2oZbLhUQ70o+UFPN4Wn1Rm8uDL7VFXf3+zkcGVaGOj3\ntHhW977M1UyugdHFkIRCwfw=\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aconexaogoias.iam.gserviceaccount.com

# App Configuration - PRODUÇÃO
NEXT_PUBLIC_APP_URL=http://146.190.174.106:3000
NODE_ENV=production
ENVEOF
    echo "✅ Arquivo .env.production criado"
else
    echo "✅ Arquivo .env.production já existe"
fi

echo "🔨 Fazendo build da aplicação..."
npm run build

echo "🔄 Reiniciando aplicação..."
pm2 restart conexaogoias || pm2 start npm --name "conexaogoias" -- start

echo "📊 Status da aplicação:"
pm2 status

echo "🌐 Testando aplicação..."
sleep 5
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000

echo "✅ Deploy concluído!"
EOF

echo ""
echo "🎯 Próximos passos:"
echo "1. Acesse: http://146.190.174.106:3000/admin/login"
echo "2. Teste o login"
echo "3. Se não funcionar, execute: ./scripts/debug-vps.sh"
