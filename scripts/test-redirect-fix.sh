#!/bin/bash

echo "🔧 Testando correção do loop de redirecionamento..."

# Verificar se o servidor está rodando
if ! curl -s http://localhost:3302 > /dev/null; then
    echo "❌ Servidor não está rodando. Inicie com: npm run dev"
    exit 1
fi

echo "✅ Servidor está rodando na porta 3302"

# Testar redirecionamento para admin
echo "🔍 Testando /admin..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3302/admin)
echo "Status code: $response"

if [ "$response" = "302" ] || [ "$response" = "307" ]; then
    echo "✅ Redirecionamento funcionando (sem loop)"
else
    echo "❌ Problema no redirecionamento"
fi

# Testar página de login
echo "🔍 Testando /admin/login..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3302/admin/login)
echo "Status code: $response"

if [ "$response" = "200" ]; then
    echo "✅ Página de login acessível"
else
    echo "❌ Problema na página de login"
fi

# Testar dashboard (deve redirecionar se não autenticado)
echo "🔍 Testando /admin/dashboard..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3302/admin/dashboard)
echo "Status code: $response"

if [ "$response" = "302" ] || [ "$response" = "307" ]; then
    echo "✅ Dashboard redirecionando corretamente"
else
    echo "❌ Problema no dashboard"
fi

echo "🎉 Teste concluído!"
