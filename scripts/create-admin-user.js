// Script para criar um usuário administrador de teste
// Execute com: node scripts/create-admin-user.js

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin SDK
const serviceAccount = require('../src/lib/firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'aconexaogoias'
});

const db = admin.firestore();

async function createAdminUser() {
  try {
    console.log('🚀 Criando usuário administrador de teste...');
    
    // Dados do usuário admin
    const adminUser = {
      name: 'Administrador',
      email: 'admin@conexaogoias.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null
    };
    
    // Criar usuário no Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: adminUser.email,
      password: 'admin123', // Senha temporária
      displayName: adminUser.name,
      emailVerified: true
    });
    
    console.log('✅ Usuário criado no Firebase Auth:', userRecord.uid);
    
    // Salvar dados do usuário no Firestore
    await db.collection('users').doc(userRecord.uid).set(adminUser);
    
    console.log('✅ Dados do usuário salvos no Firestore');
    
    console.log('\n🎉 Usuário administrador criado com sucesso!');
    console.log('📧 Email: admin@conexaogoias.com');
    console.log('🔑 Senha: admin123');
    console.log('🆔 UID:', userRecord.uid);
    console.log('\n💡 Agora você pode fazer login no painel administrativo!');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n⚠️  O usuário já existe. Tentando atualizar...');
      
      try {
        // Buscar usuário existente
        const userRecord = await admin.auth().getUserByEmail('admin@conexaogoias.com');
        
        // Atualizar senha
        await admin.auth().updateUser(userRecord.uid, {
          password: 'admin123'
        });
        
        // Atualizar dados no Firestore
        await db.collection('users').doc(userRecord.uid).set({
          name: 'Administrador',
          email: 'admin@conexaogoias.com',
          role: 'admin',
          isActive: true,
          updatedAt: new Date()
        }, { merge: true });
        
        console.log('✅ Usuário atualizado com sucesso!');
        console.log('📧 Email: admin@conexaogoias.com');
        console.log('🔑 Senha: admin123');
        
      } catch (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError);
      }
    }
  } finally {
    process.exit(0);
  }
}

createAdminUser();
