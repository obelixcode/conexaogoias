#!/bin/bash

# Script para debug do Firebase na VPS
# Uso: ./scripts/firebase-debug.sh

echo "🔍 DEBUG FIREBASE - VPS"
echo "======================"

# Verificar se estamos na VPS
if [ -z "$NODE_ENV" ] || [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Este script é recomendado para ser executado na VPS (NODE_ENV=production)"
fi

echo ""
echo "1. Verificando variáveis de ambiente..."
echo "========================================"

# Verificar arquivos .env
if [ -f ".env.production" ]; then
    echo "✅ .env.production encontrado"
    source .env.production
elif [ -f ".env" ]; then
    echo "✅ .env encontrado"
    source .env
else
    echo "❌ Nenhum arquivo .env encontrado"
    exit 1
fi

# Verificar variáveis do Firebase
echo ""
echo "2. Verificando configurações do Firebase..."
echo "==========================================="

check_var() {
    local var_name=$1
    local var_value=$2
    
    if [ -z "$var_value" ]; then
        echo "❌ $var_name: não encontrada"
        return 1
    elif [[ "$var_value" == *"123456789"* ]] || [[ "$var_value" == *"abcdef123456"* ]] || [[ "$var_value" == *"your-"* ]]; then
        echo "⚠️  $var_name: valor placeholder detectado"
        return 1
    else
        echo "✅ $var_name: configurada"
        return 0
    fi
}

# Verificar variáveis públicas
check_var "NEXT_PUBLIC_FIREBASE_API_KEY" "$NEXT_PUBLIC_FIREBASE_API_KEY"
check_var "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
check_var "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "$NEXT_PUBLIC_FIREBASE_PROJECT_ID"
check_var "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
check_var "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
check_var "NEXT_PUBLIC_FIREBASE_APP_ID" "$NEXT_PUBLIC_FIREBASE_APP_ID"

echo ""
echo "3. Verificando configurações do Firebase Admin..."
echo "================================================"

check_var "FIREBASE_ADMIN_PROJECT_ID" "$FIREBASE_ADMIN_PROJECT_ID"
check_var "FIREBASE_ADMIN_CLIENT_EMAIL" "$FIREBASE_ADMIN_CLIENT_EMAIL"

if [ -n "$FIREBASE_ADMIN_PRIVATE_KEY" ]; then
    if [[ "$FIREBASE_ADMIN_PRIVATE_KEY" == *"BEGIN PRIVATE KEY"* ]]; then
        echo "✅ FIREBASE_ADMIN_PRIVATE_KEY: formato correto"
    else
        echo "⚠️  FIREBASE_ADMIN_PRIVATE_KEY: formato pode estar incorreto"
    fi
else
    echo "❌ FIREBASE_ADMIN_PRIVATE_KEY: não encontrada"
fi

echo ""
echo "4. Verificando conectividade..."
echo "==============================="

# Testar conectividade com Firebase
if command -v curl &> /dev/null; then
    echo "Testando conectividade com Firebase Auth..."
    if curl -s --connect-timeout 10 "https://identitytoolkit.googleapis.com" > /dev/null; then
        echo "✅ Firebase Auth acessível"
    else
        echo "❌ Firebase Auth não acessível"
    fi
    
    echo "Testando conectividade com Firestore..."
    if curl -s --connect-timeout 10 "https://firestore.googleapis.com" > /dev/null; then
        echo "✅ Firestore acessível"
    else
        echo "❌ Firestore não acessível"
    fi
else
    echo "⚠️  curl não encontrado, pulando testes de conectividade"
fi

echo ""
echo "5. Verificando aplicação..."
echo "==========================="

# Verificar se a aplicação está rodando
if command -v pm2 &> /dev/null; then
    echo "Status do PM2:"
    pm2 status
    echo ""
    
    echo "Logs recentes:"
    pm2 logs --lines 10
else
    echo "⚠️  PM2 não encontrado"
fi

echo ""
echo "6. Próximos passos recomendados..."
echo "=================================="

echo "1. Acesse: https://console.firebase.google.com/project/$NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "2. Vá para Authentication > Users e verifique se existe um usuário"
echo "3. Vá para Authentication > Settings > Authorized domains"
echo "4. Adicione seu domínio de produção"
echo "5. Vá para Firestore Database e verifique se existe a collection 'users'"
echo "6. Teste o login em: https://conexaogoias.com/admin/login"

echo ""
echo "🔧 Para mais detalhes, execute:"
echo "node scripts/validate-firebase-config.js"
