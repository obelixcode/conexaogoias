#!/bin/bash

# Script para corrigir regras do Firestore
# Execute: ./scripts/fix-firestore-rules.sh

set -e

echo "🔧 Corrigindo regras do Firestore..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "firestore.rules" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# Parar aplicação se estiver rodando
print_status "Parando aplicação..."
pm2 stop conexaogoias 2>/dev/null || true

# Backup das regras atuais
print_status "Fazendo backup das regras atuais..."
cp firestore.rules firestore.rules.backup

# Criar regras mais permissivas para desenvolvimento
print_status "Criando regras permissivas para desenvolvimento..."
cat > firestore.rules << 'EOF'
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todas as coleções durante desenvolvimento
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Regras específicas para produção (comentadas por enquanto)
    // match /news/{newsId} {
    //   allow read: if true;
    //   allow write: if request.auth != null && 
    //     (request.auth.token.role == 'admin' || request.auth.token.role == 'editor');
    // }
    
    // match /categories/{categoryId} {
    //   allow read: if true;
    //   allow write: if request.auth != null && 
    //     (request.auth.token.role == 'admin' || request.auth.token.role == 'editor');
    // }
    
    // match /settings/{settingId} {
    //   allow read: if true;
    //   allow write: if request.auth != null && request.auth.token.role == 'admin';
    // }
    
    // match /banners/{bannerId} {
    //   allow read: if true;
    //   allow write: if request.auth != null && request.auth.token.role == 'admin';
    // }
    
    // match /users/{userId} {
    //   allow read, write: if request.auth != null && 
    //     (request.auth.uid == userId || request.auth.token.role == 'admin');
    // }
  }
}
EOF

print_status "Regras do Firestore atualizadas para desenvolvimento!"

# Verificar se o Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    print_warning "Firebase CLI não encontrado. Instalando..."
    npm install -g firebase-tools
fi

# Verificar se está logado no Firebase
if ! firebase projects:list &> /dev/null; then
    print_warning "Não está logado no Firebase. Faça login primeiro:"
    print_info "firebase login"
    print_warning "Depois execute este script novamente."
    exit 1
fi

# Deploy das regras
print_status "Fazendo deploy das regras do Firestore..."
if firebase deploy --only firestore:rules; then
    print_status "✅ Regras do Firestore deployadas com sucesso!"
else
    print_error "Falha no deploy das regras do Firestore"
    print_warning "Tente fazer login no Firebase: firebase login"
    exit 1
fi

# Verificar se o arquivo .env.production tem a URL correta
print_status "Verificando configuração da URL da aplicação..."
if grep -q "localhost" .env.production; then
    print_warning "URL ainda está como localhost. Atualizando..."
    
    # Obter IP público do servidor
    PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "localhost")
    
    # Atualizar URL no .env.production
    sed -i "s|NEXT_PUBLIC_APP_URL=http://localhost:3000|NEXT_PUBLIC_APP_URL=http://$PUBLIC_IP|" .env.production
    
    print_status "URL atualizada para: http://$PUBLIC_IP"
    print_warning "⚠️  Lembre-se de configurar um domínio personalizado se necessário"
fi

# Fazer build novamente
print_status "Fazendo build da aplicação..."
if npm run build; then
    print_status "✅ Build concluído com sucesso!"
    
    # Iniciar aplicação
    print_status "Iniciando aplicação..."
    pm2 start conexaogoias
    
    print_status "Regras do Firestore corrigidas! 🎉"
    print_info "Aplicação rodando com permissões corretas"
    print_warning "⚠️  As regras estão em modo desenvolvimento (muito permissivas)"
    print_warning "⚠️  Configure regras mais restritivas para produção"
else
    print_error "Build falhou após correção das regras"
    print_warning "Verifique os logs acima para detalhes do erro"
    exit 1
fi
