const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

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
