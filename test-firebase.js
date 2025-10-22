// Script para testar a conexão com Firebase
// Execute com: node test-firebase.js

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM",
  authDomain: "aconexaogoias.firebaseapp.com",
  projectId: "aconexaogoias",
  storageBucket: "aconexaogoias.firebasestorage.app",
  messagingSenderId: "6509088743",
  appId: "1:6509088743:web:f1866c676e18c53204f742"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirebaseConnection() {
  console.log('🔍 Testando conexão com Firebase...');
  
  try {
    // Teste 1: Verificar se o projeto está acessível
    console.log('✅ Firebase inicializado com sucesso');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    
    // Teste 2: Tentar fazer login (substitua pelos seus dados)
    const email = 'admin@conexaogoias.com'; // SUBSTITUA PELO SEU EMAIL
    const password = 'sua_senha_aqui'; // SUBSTITUA PELA SUA SENHA
    
    console.log('🔐 Tentando fazer login...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login realizado com sucesso!');
    console.log('👤 User UID:', userCredential.user.uid);
    
    // Teste 3: Verificar dados do usuário no Firestore
    console.log('📄 Verificando dados do usuário no Firestore...');
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ Usuário encontrado no Firestore:');
      console.log('   Nome:', userData.name);
      console.log('   Email:', userData.email);
      console.log('   Role:', userData.role);
      console.log('   Ativo:', userData.isActive);
    } else {
      console.log('❌ Usuário NÃO encontrado no Firestore!');
      console.log('   Você precisa criar o documento do usuário no Firestore.');
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Solução: Crie um usuário no Firebase Console > Authentication > Users');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Solução: Verifique a senha no Firebase Console');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Solução: Verifique o formato do email');
    } else if (error.code === 'permission-denied') {
      console.log('💡 Solução: Verifique as regras do Firestore');
    }
  }
}

testFirebaseConnection();
