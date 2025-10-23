#!/bin/bash

echo "🔧 Corrigindo conexão com Firebase..."

# Verificar se o arquivo .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ Arquivo .env.local não encontrado"
    echo "📝 Criando arquivo de exemplo..."
    
    cat > .env.local.example << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email

# Optional: Use Firebase Emulators (set to 'true' to enable)
# NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
EOF
    
    echo "✅ Arquivo .env.local.example criado"
    echo "📝 Copie e configure suas credenciais do Firebase"
    exit 1
fi

echo "✅ Arquivo .env.local encontrado"

# Verificar se as variáveis estão configuradas
echo "🔍 Verificando configurações do Firebase..."

# Verificar se as variáveis estão definidas
if grep -q "your_api_key_here" .env.local; then
    echo "❌ Configurações do Firebase não foram definidas"
    echo "📝 Configure suas credenciais do Firebase no arquivo .env.local"
    exit 1
fi

echo "✅ Configurações do Firebase encontradas"

# Desabilitar emuladores se não estiverem configurados
if ! grep -q "NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true" .env.local; then
    echo "🔧 Desabilitando emuladores do Firebase..."
    echo "" >> .env.local
    echo "# Firebase Emulators disabled" >> .env.local
    echo "NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false" >> .env.local
fi

echo "✅ Firebase configurado para produção"
echo "🔄 Reinicie o servidor para aplicar as mudanças"
