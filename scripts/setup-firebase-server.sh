#!/bin/bash

echo "🔧 Configurando Firebase no servidor..."

# Navegar para o diretório do projeto
cd /var/www/conexaogoias

# Criar arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    
    cat > .env.local << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742

# Firebase Admin Configuration (opcional)
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias

# Desabilitar emuladores
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
EOF
    
    echo "✅ Arquivo .env.local criado"
else
    echo "✅ Arquivo .env.local já existe"
fi

# Verificar se as variáveis estão configuradas
echo "🔍 Verificando configurações do Firebase..."

if grep -q "AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM" .env.local; then
    echo "✅ Configurações do Firebase encontradas"
else
    echo "❌ Configurações do Firebase não encontradas"
    exit 1
fi

# Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart conexaogoias

# Verificar status
echo "✅ Verificando status..."
pm2 status

echo "🎉 Configuração do Firebase concluída!"
echo "🌐 Teste o login em: http://SEU_IP:3302/admin/login"
echo "📧 Use o email: admin@ohoje.com"
