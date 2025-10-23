#!/bin/bash

echo "🔧 Testando sistema de autenticação simples..."

# Verificar se o servidor está rodando
if ! curl -s http://localhost:3302 > /dev/null; then
    echo "❌ Servidor não está rodando. Inicie com: npm run dev"
    exit 1
fi

echo "✅ Servidor está rodando na porta 3302"

# Testar acesso ao admin sem autenticação
echo "🔍 Testando acesso ao admin sem autenticação..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3302/admin)
echo "Status code: $response"

if [ "$response" = "307" ]; then
    echo "✅ Admin redirecionando para login (correto)"
else
    echo "❌ Admin não está redirecionando corretamente"
fi

# Testar página de login
echo "🔍 Testando página de login..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3302/admin/login)
echo "Status code: $response"

if [ "$response" = "200" ]; then
    echo "✅ Página de login acessível"
else
    echo "❌ Problema na página de login"
fi

# Testar dashboard sem autenticação
echo "🔍 Testando dashboard sem autenticação..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3302/admin/dashboard)
echo "Status code: $response"

if [ "$response" = "307" ]; then
    echo "✅ Dashboard redirecionando para login (correto)"
else
    echo "❌ Dashboard acessível sem autenticação (PROBLEMA!)"
fi

# Testar tentativa de acesso direto a outras rotas admin
echo "🔍 Testando outras rotas admin..."
routes=("/admin/posts" "/admin/categories" "/admin/banners" "/admin/settings")

for route in "${routes[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3302$route")
    echo "  $route: $response"
    
    if [ "$response" = "307" ]; then
        echo "    ✅ Redirecionando corretamente"
    else
        echo "    ❌ Acessível sem autenticação"
    fi
done

echo "🎉 Teste de autenticação concluído!"
echo ""
echo "📋 Resumo:"
echo "- Admin deve redirecionar para login (307)"
echo "- Login deve ser acessível (200)"
echo "- Dashboard deve redirecionar sem auth (307)"
echo "- Todas as rotas admin devem redirecionar sem auth (307)"
