#!/usr/bin/env node

// Script para verificar usuário admin e permissões
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM",
  authDomain: "aconexaogoias.firebaseapp.com",
  projectId: "aconexaogoias",
  storageBucket: "aconexaogoias.firebasestorage.app",
  messagingSenderId: "6509088743",
  appId: "1:6509088743:web:f1866c676e18c53204f742"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function checkAdminUser() {
  try {
    console.log('🔍 Verificando usuários admin no Firestore...');
    
    // Buscar usuários com role admin
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log(`📋 Encontrados ${usersSnapshot.size} usuários:`);
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`   👤 ${doc.id}: ${userData.email} (${userData.role}) - Ativo: ${userData.isActive}`);
    });
    
    // Verificar se há usuários admin ativos
    const adminUsers = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.role === 'admin' && userData.isActive) {
        adminUsers.push({
          id: doc.id,
          email: userData.email,
          name: userData.name
        });
      }
    });
    
    if (adminUsers.length > 0) {
      console.log('✅ Usuários admin encontrados:');
      adminUsers.forEach(admin => {
        console.log(`   📧 ${admin.email} (${admin.name})`);
      });
    } else {
      console.log('❌ Nenhum usuário admin ativo encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error.message);
  }
}

// Executar verificação
checkAdminUser().then(() => {
  console.log('✅ Verificação concluída');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
