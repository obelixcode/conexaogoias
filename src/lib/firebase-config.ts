// Configuração centralizada do Firebase com fallback inteligente
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || 'demo-project.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '1:123456789:web:demo-app-id',
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

  // Verificar se está usando valores demo/fallback
  const isUsingDemoValues = firebaseConfig.apiKey === 'demo-api-key' || 
                           firebaseConfig.projectId === 'demo-project';

  if (isUsingDemoValues) {
    console.warn('⚠️ Usando configurações demo do Firebase');
    console.warn('🔧 Configure as variáveis de ambiente para usar credenciais reais');
    
    // Em desenvolvimento, permitir valores demo
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Modo desenvolvimento: usando configurações demo');
      return true;
    }
    
    // Em produção, falhar se usando valores demo
    console.error('❌ Configurações demo não permitidas em produção');
    return false;
  }

  const missing = requiredConfig.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Configurações do Firebase faltando:', missing);
    console.warn('📋 Variáveis de ambiente necessárias:');
    missing.forEach(key => {
      const envVar = `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`;
      console.warn(`   - ${envVar}`);
    });
    
    // Em desenvolvimento, apenas avisar mas não falhar
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Modo desenvolvimento: continuando com configurações parciais');
      return true;
    }
    
    return false;
  }

  // Verificar se as configurações não são placeholders (apenas em produção)
  if (process.env.NODE_ENV === 'production') {
    const placeholderValues = [
      'your-api-key',
      'your-project-id',
      'your-auth-domain',
      'your-storage-bucket',
      'your-messaging-sender-id',
      'your-app-id'
    ];

    const hasPlaceholders = Object.values(firebaseConfig).some(value => 
      placeholderValues.some(placeholder => value?.includes(placeholder))
    );

    if (hasPlaceholders) {
      console.error('❌ Configurações do Firebase contêm valores placeholder');
      console.error('🔧 Substitua os valores placeholder pelas credenciais reais do Firebase Console');
      return false;
    }
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
