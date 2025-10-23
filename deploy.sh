#!/bin/bash

# Deploy script para EasyPanel/DigitalOcean
# Resolve problemas de diretório e build

set -e  # Exit on any error

echo "🚀 Iniciando deploy do Conexão Goiás..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado. Verificando diretório atual..."
    pwd
    ls -la
    echo "🔍 Procurando por package.json..."
    find . -name "package.json" -type f 2>/dev/null || echo "❌ package.json não encontrado em nenhum lugar"
    exit 1
fi

echo "✅ package.json encontrado"

# Limpar cache e node_modules se existirem
echo "🧹 Limpando cache e dependências antigas..."
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# Verificar Node.js e npm
echo "📦 Verificando versões..."
node --version
npm --version

# Instalar dependências
echo "📥 Instalando dependências..."
npm install --legacy-peer-deps --no-audit --no-fund

# Verificar se as variáveis de ambiente estão configuradas
echo "🔧 Verificando variáveis de ambiente..."
if [ -z "$NEXT_PUBLIC_FIREBASE_API_KEY" ]; then
    echo "⚠️  NEXT_PUBLIC_FIREBASE_API_KEY não definida"
fi

if [ -z "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" ]; then
    echo "⚠️  NEXT_PUBLIC_FIREBASE_PROJECT_ID não definida"
fi

# Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d ".next" ]; then
    echo "❌ Build falhou - diretório .next não foi criado"
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Verificar arquivos essenciais
echo "🔍 Verificando arquivos essenciais..."
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ Modo standalone detectado"
elif [ -f ".next/server.js" ]; then
    echo "✅ Build padrão detectado"
else
    echo "⚠️  Estrutura de build não reconhecida"
    ls -la .next/
fi

# Iniciar aplicação
echo "🚀 Iniciando aplicação..."
npm start
