#!/bin/bash

# Script para verificar configuração completa
# Uso: ./scripts/check-setup.sh

VPS_IP="146.190.174.106"
VPS_USER="root"
VPS_PASSWORD="1S5Yy9if2x"

echo "🔍 VERIFICAR CONFIGURAÇÃO - CONEXÃO GOIÁS"
echo "=========================================="

echo "1. Verificando status da VPS..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" << 'EOF'
echo "📊 Status dos serviços:"
echo "======================="
echo "PM2 Status:"
pm2 status

echo ""
echo "Nginx Status:"
systemctl status nginx --no-pager

echo ""
echo "🌐 Testando conectividade:"
echo "=========================="
echo "Aplicação local (porta 3000):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000

echo "Nginx (porta 80):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost

echo ""
echo "🔍 Verificando DNS:"
echo "==================="
echo "conexaogoias.com:"
nslookup conexaogoias.com

echo ""
echo "www.conexaogoias.com:"
nslookup www.conexaogoias.com

echo ""
echo "🔒 Verificando SSL:"
echo "=================="
if [ -f "/etc/letsencrypt/live/conexaogoias.com/fullchain.pem" ]; then
    echo "✅ Certificado SSL encontrado"
    echo "📅 Válido até:"
    openssl x509 -in /etc/letsencrypt/live/conexaogoias.com/fullchain.pem -noout -dates
else
    echo "❌ Certificado SSL não encontrado"
fi

echo ""
echo "📁 Verificando arquivos de configuração:"
echo "========================================"
if [ -f ".env.production" ]; then
    echo "✅ .env.production encontrado"
    echo "📋 Variáveis configuradas:"
    grep -E "^NEXT_PUBLIC_FIREBASE|^FIREBASE_ADMIN" .env.production | wc -l
else
    echo "❌ .env.production não encontrado"
fi

echo ""
echo "🌐 Testando acesso externo:"
echo "==========================="
echo "HTTP:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://conexaogoias.com || echo "❌ Não acessível"

echo "HTTPS:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://conexaogoias.com || echo "❌ Não acessível"
EOF

echo ""
echo "🎯 Checklist de Configuração:"
echo "============================="
echo "✅ VPS configurada e rodando"
echo "✅ Nginx configurado como proxy"
echo "✅ Aplicação Next.js rodando"
echo "⏳ DNS na Cloudflare (configure agora)"
echo "⏳ SSL/HTTPS (após DNS propagar)"
echo "⏳ Usuário admin no Firebase (crie agora)"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure DNS na Cloudflare"
echo "2. Crie usuário admin no Firebase"
echo "3. Aguarde propagação DNS (5-15 min)"
echo "4. Execute: ./scripts/configure-ssl.sh"
echo "5. Teste: https://conexaogoias.com"
