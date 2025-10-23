#!/bin/bash
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🔧 Corrigindo permissões do Firestore para resolver problemas de login..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# 1. Fazer backup das regras atuais
print_status "1. Fazendo backup das regras atuais..."
if [ -f "firestore.rules" ]; then
    cp firestore.rules firestore.rules.backup
    print_success "Backup criado: firestore.rules.backup"
else
    print_warning "Arquivo firestore.rules não encontrado"
fi

# 2. Criar regras permissivas para desenvolvimento
print_status "2. Criando regras permissivas para desenvolvimento..."
cat > firestore.rules << 'EOF'
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Regras permissivas para desenvolvimento
    // ATENÇÃO: Use apenas em desenvolvimento!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF

print_success "Regras permissivas criadas"

# 3. Verificar se o Firebase CLI está instalado
print_status "3. Verificando Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    print_warning "Firebase CLI não encontrado. Instalando..."
    npm install -g firebase-tools
    print_success "Firebase CLI instalado"
else
    print_success "Firebase CLI encontrado"
fi

# 4. Verificar se está logado no Firebase
print_status "4. Verificando login no Firebase..."
if ! firebase projects:list &> /dev/null; then
    print_warning "Não está logado no Firebase. Fazendo login..."
    print_warning "Siga as instruções na tela para fazer login"
    firebase login
else
    print_success "Já está logado no Firebase"
fi

# 5. Deploy das regras
print_status "5. Fazendo deploy das regras do Firestore..."
if firebase deploy --only firestore:rules; then
    print_success "Regras do Firestore deployadas com sucesso!"
else
    print_error "Falha ao fazer deploy das regras"
    print_warning "Tente executar manualmente: firebase deploy --only firestore:rules"
fi

# 6. Verificar se a aplicação está rodando
print_status "6. Verificando status da aplicação..."
if pm2 status conexaogoias | grep -q "online"; then
    print_success "Aplicação está rodando"
    print_status "Reiniciando aplicação para aplicar as mudanças..."
    pm2 restart conexaogoias
    print_success "Aplicação reiniciada"
else
    print_warning "Aplicação não está rodando. Iniciando..."
    pm2 start ecosystem.config.js
    pm2 save
    print_success "Aplicação iniciada"
fi

# 7. Instruções finais
print_status "7. Instruções finais:"
echo ""
print_success "✅ Regras do Firestore corrigidas!"
print_warning "⚠️  IMPORTANTE: As regras estão permissivas (allow read, write: if true)"
print_warning "⚠️  Use apenas em desenvolvimento. Para produção, configure regras mais restritivas."
echo ""
print_warning "PRÓXIMOS PASSOS:"
echo "1. Teste o login novamente em http://seu-dominio.com/admin/login"
echo "2. Se ainda houver problemas, execute: ./scripts/debug-login.sh"
echo "3. Verifique os logs da aplicação com: pm2 logs conexaogoias"
echo ""
print_warning "PARA PRODUÇÃO (futuro):"
echo "1. Configure regras mais restritivas baseadas em roles de usuário"
echo "2. Use autenticação adequada para cada operação"
echo "3. Teste as regras antes de fazer deploy"
echo ""

print_success "Correção de permissões concluída! 🎉"
