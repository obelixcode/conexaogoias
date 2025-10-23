import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

// Configuração do Firebase Admin SDK
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Inicializar Firebase Admin apenas uma vez
let adminApp;
if (getApps().length === 0) {
  try {
    // Tentar usar arquivo de credenciais JSON primeiro
    const serviceAccountPath = path.join(process.cwd(), 'aconexaogoias-firebase-adminsdk-fbsvc-52aa2cb5ec.json');
    
    adminApp = initializeApp({
      credential: cert(serviceAccountPath),
      projectId: firebaseAdminConfig.projectId,
    });
    console.log('✅ Firebase Admin SDK inicializado com arquivo de credenciais');
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin SDK:', error);
    // Fallback: tentar usar variáveis de ambiente
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId: firebaseAdminConfig.projectId,
          clientEmail: firebaseAdminConfig.clientEmail,
          privateKey: firebaseAdminConfig.privateKey,
        }),
        projectId: firebaseAdminConfig.projectId,
      });
      console.log('✅ Firebase Admin SDK inicializado com variáveis de ambiente');
    } catch (fallbackError) {
      console.error('❌ Erro no fallback:', fallbackError);
      // Último recurso: usar configuração padrão
      adminApp = initializeApp({
        projectId: firebaseAdminConfig.projectId,
      });
      console.log('⚠️ Firebase Admin SDK inicializado sem credenciais (modo limitado)');
    }
  }
} else {
  adminApp = getApps()[0];
}

// Exportar serviços do Firebase Admin
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export default adminApp;
