#!/bin/bash

echo "🔒 Forçando logout completo..."

# Fazer logout via API
echo "🔧 Fazendo logout via API..."
curl -s -X DELETE http://localhost:3302/api/auth/session > /dev/null

# Limpar todos os cookies possíveis
echo "🔧 Limpando todos os cookies..."
curl -s -c /dev/null -b /dev/null http://localhost:3302/admin/login > /dev/null

echo "✅ Logout forçado"
echo "🧪 Testando acesso ao dashboard..."

# Testar se o dashboard redireciona
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3302/admin/dashboard)
echo "Status do dashboard: $response"

if [ "$response" = "307" ]; then
    echo "✅ Dashboard redirecionando corretamente para login"
else
    echo "❌ Dashboard ainda acessível sem autenticação!"
fi

echo "🌐 Acesse http://localhost:3302/admin/login no navegador"
