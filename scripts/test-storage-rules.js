#!/usr/bin/env node

// Script para testar as regras do Firebase Storage
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
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
const storage = getStorage(app);
const auth = getAuth(app);

async function testStorageRules() {
  try {
    console.log('🔐 Fazendo login como admin...');
    
    // Login como admin (você precisa fornecer as credenciais)
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'admin@conexaogoias.com', // Substitua pelas credenciais corretas
      'admin123' // Substitua pela senha correta
    );
    
    console.log('✅ Login realizado:', userCredential.user.email);
    
    // Criar um arquivo de teste
    const testContent = 'Teste de upload';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    console.log('📤 Testando upload para logos/...');
    const logoRef = ref(storage, 'logos/test_logo.txt');
    
    try {
      await uploadBytes(logoRef, blob);
      console.log('✅ Upload para logos/ funcionou!');
      
      const downloadURL = await getDownloadURL(logoRef);
      console.log('✅ Download URL:', downloadURL);
      
    } catch (error) {
      console.error('❌ Erro no upload para logos/:', error.message);
    }
    
    console.log('📤 Testando upload para banners/...');
    const bannerRef = ref(storage, 'banners/test_banner.txt');
    
    try {
      await uploadBytes(bannerRef, blob);
      console.log('✅ Upload para banners/ funcionou!');
    } catch (error) {
      console.error('❌ Erro no upload para banners/:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testStorageRules().then(() => {
  console.log('✅ Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
