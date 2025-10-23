#!/bin/bash

# Script para configurar SSL após DNS propagar
# Uso: ./scripts/configure-ssl.sh

VPS_IP="146.190.174.106"
VPS_USER="root"
VPS_PASSWORD="1S5Yy9if2x"

echo "🔒 CONFIGURAR SSL - CONEXÃO GOIÁS"
echo "================================="

echo "1. Conectando na VPS e configurando SSL..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" << 'EOF'
echo "🔍 Verificando se DNS propagou..."
nslookup conexaogoias.com
nslookup www.conexaogoias.com

echo "🔒 Configurando SSL com Let's Encrypt..."
certbot --nginx -d conexaogoias.com -d www.conexaogoias.com --non-interactive --agree-tos --email admin@conexaogoias.com

if [ $? -eq 0 ]; then
    echo "✅ SSL configurado com sucesso!"
    echo "📅 Configurando renovação automática..."
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    echo "🔄 Reiniciando Nginx..."
    systemctl restart nginx
    
    echo "🌐 Testando HTTPS..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" https://conexaogoias.com
    curl -s -o /dev/null -w "Status: %{http_code}\n" https://www.conexaogoias.com
    
    echo "✅ SSL configurado e funcionando!"
else
    echo "❌ Erro ao configurar SSL"
    echo "🔍 Verifique se o DNS propagou corretamente"
fi
EOF

echo ""
echo "🎯 Próximos passos:"
echo "1. Configure os DNS na Cloudflare primeiro"
echo "2. Aguarde propagação DNS (5-15 minutos)"
echo "3. Execute este script novamente"
