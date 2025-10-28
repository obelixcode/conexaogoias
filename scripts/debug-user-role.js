#!/usr/bin/env node

// Script para debugar a função getUserRole
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
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

async function debugUserRole() {
  try {
    console.log('🔐 Fazendo login...');
    
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'admin@conexaogoias.com',
      'admin123'
    );
    
    console.log('✅ Login realizado:', userCredential.user.email);
    console.log('🆔 User ID:', userCredential.user.uid);
    
    // Simular a função getUserRole() das regras do Storage
    console.log('🔍 Simulando função getUserRole()...');
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('📋 Dados do usuário:');
      console.log('   Email:', userData.email);
      console.log('   Nome:', userData.name);
      console.log('   Role:', userData.role);
      console.log('   Ativo:', userData.isActive);
      
      // Testar a lógica das regras
      const isAuthenticated = userCredential.user != null;
      const userRole = userData.role;
      const isAdmin = isAuthenticated && userRole === 'admin';
      const isSuperAdmin = isAuthenticated && userRole === 'super_admin';
      
      console.log('🧪 Teste da lógica das regras:');
      console.log('   isAuthenticated:', isAuthenticated);
      console.log('   userRole === "admin":', userRole === 'admin');
      console.log('   userRole === "super_admin":', userRole === 'super_admin');
      console.log('   isAdmin:', isAdmin);
      console.log('   isSuperAdmin:', isSuperAdmin);
      console.log('   (isAdmin || isSuperAdmin):', (isAdmin || isSuperAdmin));
      
    } else {
      console.log('❌ Documento do usuário não encontrado no Firestore!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar debug
debugUserRole().then(() => {
  console.log('✅ Debug concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
