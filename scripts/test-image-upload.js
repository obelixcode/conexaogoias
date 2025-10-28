#!/usr/bin/env node

// Script para testar upload com arquivo de imagem real
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

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

async function testImageUpload() {
  try {
    console.log('🔐 Fazendo login...');
    
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'admin@conexaogoias.com',
      'admin123'
    );
    
    console.log('✅ Login realizado:', userCredential.user.email);
    
    // Criar um arquivo de imagem simples (1x1 pixel PNG)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc.
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, // compressed data
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // more data
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
      0xAE, 0x42, 0x60, 0x82
    ]);
    
    console.log('📤 Testando upload de imagem PNG para logos/test_logo.png...');
    const logoRef = ref(storage, 'logos/test_logo.png');
    
    try {
      await uploadBytes(logoRef, pngData, {
        contentType: 'image/png'
      });
      console.log('✅ Upload de imagem funcionou!');
      console.log('🎉 As regras do Storage estão funcionando!');
      
    } catch (error) {
      console.error('❌ Erro no upload:', error.code);
      console.error('❌ Mensagem:', error.message);
      
      if (error.code === 'storage/unauthorized') {
        console.log('🔍 Ainda há problema de permissão');
        console.log('💡 Vou tentar com regras ainda mais permissivas...');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar teste
testImageUpload().then(() => {
  console.log('✅ Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
