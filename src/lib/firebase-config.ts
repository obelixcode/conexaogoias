// Configuração centralizada do Firebase
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verificar se todas as configurações estão presentes
export function validateFirebaseConfig() {
  const requiredConfig = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missing = requiredConfig.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missing.length > 0) {
    console.error('❌ Configurações do Firebase faltando:', missing);
    return false;
  }
  
  console.log('✅ Configurações do Firebase válidas');
  return true;
}

// Configuração do Firebase Admin
export const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')?.replace(/"/g, ''),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

// Verificar configurações do Firebase Admin
export function validateFirebaseAdminConfig() {
  const requiredAdminConfig = [
    'projectId',
    'privateKey',
    'clientEmail'
  ];

  const missing = requiredAdminConfig.filter(key => !firebaseAdminConfig[key as keyof typeof firebaseAdminConfig]);
  
  if (missing.length > 0) {
    console.error('❌ Configurações do Firebase Admin faltando:', missing);
    return false;
  }
  
  console.log('✅ Configurações do Firebase Admin válidas');
  return true;
}
