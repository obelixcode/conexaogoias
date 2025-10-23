#!/bin/bash

# Script para debug da VPS
# Uso: ./scripts/debug-vps.sh

VPS_IP="146.190.174.106"
VPS_USER="root"
VPS_PASSWORD="1S5Yy9if2x"

echo "🔍 DEBUG VPS - CONEXÃO GOIÁS"
echo "=============================="

echo "1. Conectando na VPS..."
echo "IP: $VPS_IP"
echo "Usuário: $VPS_USER"
echo ""

# Instalar sshpass se não existir
if ! command -v sshpass &> /dev/null; then
    echo "📦 Instalando sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

echo "2. Verificando status da aplicação..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" << 'EOF'
echo "📊 Status do PM2:"
pm2 status

echo ""
echo "📋 Logs recentes da aplicação:"
pm2 logs conexaogoias --lines 20

echo ""
echo "🔧 Verificando arquivos de configuração:"
ls -la | grep env

echo ""
echo "📁 Conteúdo do .env.production (se existir):"
if [ -f ".env.production" ]; then
    cat .env.production | head -10
else
    echo "❌ Arquivo .env.production não encontrado"
fi

echo ""
echo "🌐 Verificando se a aplicação está rodando:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "❌ Aplicação não está respondendo"

echo ""
echo "🔍 Verificando configurações do Next.js:"
if [ -f "next.config.ts" ]; then
    echo "✅ next.config.ts encontrado"
else
    echo "❌ next.config.ts não encontrado"
fi
EOF

echo ""
echo "3. Próximos passos recomendados:"
echo "================================"
echo "1. Acesse: http://$VPS_IP:3000/admin/login"
echo "2. Tente fazer login"
echo "3. Verifique os logs com: pm2 logs conexaogoias --follow"
echo "4. Se não funcionar, execute:"
echo "   - git pull origin main"
echo "   - npm run build"
echo "   - pm2 restart conexaogoias"
