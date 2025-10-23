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

print_status "👤 Verificando e criando usuário admin no Firebase..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório da aplicação (/var/www/conexaogoias)"
    exit 1
fi

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    print_error "Arquivo .env.local não encontrado!"
    print_warning "Crie o arquivo .env.local com as configurações do Firebase"
    exit 1
fi

# Carregar variáveis de ambiente
export $(grep -v '^#' .env.local | xargs)

# Verificar se as variáveis necessárias estão definidas
if [ -z "$FIREBASE_ADMIN_PROJECT_ID" ] || [ -z "$FIREBASE_ADMIN_CLIENT_EMAIL" ] || [ -z "$FIREBASE_ADMIN_PRIVATE_KEY" ]; then
    print_error "Variáveis do Firebase Admin não encontradas no .env.local"
    print_warning "Verifique se FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY estão configuradas"
    exit 1
fi

print_success "Variáveis do Firebase Admin encontradas"

# Criar script Node.js para verificar/criar usuário
print_status "Criando script para verificar/criar usuário admin..."

cat > check-admin-user.js << 'EOF'
const admin = require('firebase-admin');

// Configurar Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function checkOrCreateAdminUser() {
  try {
    console.log('🔍 Verificando usuários existentes...');
    
    // Listar usuários (limitado a 1000)
    const listUsersResult = await auth.listUsers(1000);
    console.log(`📊 Total de usuários encontrados: ${listUsersResult.users.length}`);
    
    // Procurar por usuário admin
    let adminUser = null;
    for (const user of listUsersResult.users) {
      if (user.email === 'admin@conexaogoias.com' || user.email === 'admin@aconexaogoias.com') {
        adminUser = user;
        break;
      }
    }
    
    if (adminUser) {
      console.log('✅ Usuário admin encontrado:', adminUser.email);
      console.log('📋 UID:', adminUser.uid);
      console.log('📅 Criado em:', adminUser.metadata.creationTime);
      console.log('🔄 Último login:', adminUser.metadata.lastSignInTime || 'Nunca');
      
      // Verificar se existe no Firestore
      const userDoc = await db.collection('users').doc(adminUser.uid).get();
      if (userDoc.exists) {
        console.log('✅ Usuário existe no Firestore');
        console.log('📋 Dados do Firestore:', userDoc.data());
      } else {
        console.log('⚠️  Usuário não existe no Firestore. Criando...');
        await db.collection('users').doc(adminUser.uid).set({
          email: adminUser.email,
          name: 'Administrador',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Usuário criado no Firestore');
      }
    } else {
      console.log('❌ Usuário admin não encontrado');
      console.log('📝 Para criar um usuário admin:');
      console.log('1. Acesse o Firebase Console: https://console.firebase.google.com');
      console.log('2. Vá em Authentication > Users');
      console.log('3. Clique em "Add user"');
      console.log('4. Crie um usuário com email: admin@conexaogoias.com');
      console.log('5. Defina uma senha segura');
      console.log('6. Execute este script novamente');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
    process.exit(1);
  }
}

checkOrCreateAdminUser().then(() => {
  console.log('✅ Verificação concluída');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
EOF

print_status "Executando verificação de usuário admin..."
if node check-admin-user.js; then
    print_success "Verificação de usuário concluída"
else
    print_error "Erro na verificação de usuário"
    exit 1
fi

# Limpar arquivo temporário
rm -f check-admin-user.js

print_status "Instruções para criar usuário admin:"
echo ""
print_warning "SE O USUÁRIO ADMIN NÃO EXISTE:"
echo "1. Acesse: https://console.firebase.google.com/project/aconexaogoias/authentication/users"
echo "2. Clique em 'Add user'"
echo "3. Email: admin@conexaogoias.com (ou seu email preferido)"
echo "4. Senha: [defina uma senha segura]"
echo "5. Clique em 'Add user'"
echo "6. Execute este script novamente para verificar"
echo ""
print_warning "SE O USUÁRIO JÁ EXISTE MAS NÃO CONSEGUE FAZER LOGIN:"
echo "1. Verifique se a senha está correta"
echo "2. Verifique se o usuário está ativo no Firebase Console"
echo "3. Execute: ./scripts/debug-login.sh para diagnóstico completo"
echo ""

print_success "Verificação de usuário admin concluída! 🎉"
