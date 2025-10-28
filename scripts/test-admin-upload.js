#!/usr/bin/env node

// Script para testar upload com usuário admin real
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');
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

async function testUploadWithAdmin() {
  try {
    console.log('🔐 Testando login com admin@conexaogoias.com...');
    
    // Login como admin
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'admin@conexaogoias.com',
      'admin123' // Você precisa fornecer a senha correta
    );
    
    console.log('✅ Login realizado:', userCredential.user.email);
    console.log('🆔 User ID:', userCredential.user.uid);
    
    // Criar um arquivo de teste pequeno
    const testContent = 'Teste de upload de logo';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    console.log('📤 Testando upload para logos/test_logo.txt...');
    const logoRef = ref(storage, 'logos/test_logo.txt');
    
    try {
      await uploadBytes(logoRef, blob);
      console.log('✅ Upload para logos/ funcionou!');
      console.log('🎉 As regras do Storage estão funcionando corretamente!');
      
    } catch (error) {
      console.error('❌ Erro no upload:', error.code);
      console.error('❌ Mensagem:', error.message);
      
      if (error.code === 'storage/unauthorized') {
        console.log('🔍 Diagnóstico: Usuário não tem permissão para upload');
        console.log('💡 Possíveis causas:');
        console.log('   1. Função isAdmin() não está funcionando corretamente');
        console.log('   2. Usuário não está sendo reconhecido como admin');
        console.log('   3. Regras do Storage não foram aplicadas corretamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no login:', error.code);
    console.error('❌ Mensagem:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Usuário não encontrado. Verifique o email.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Senha incorreta. Verifique a senha.');
    }
  }
}

// Executar teste
testUploadWithAdmin().then(() => {
  console.log('✅ Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
