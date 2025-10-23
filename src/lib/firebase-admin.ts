import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseAdminConfig, validateFirebaseAdminConfig } from './firebase-config';

let adminApp: App;

export function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      console.log('🔧 Inicializando Firebase Admin SDK...');
      
      // Validar configurações do Firebase Admin
      if (!validateFirebaseAdminConfig()) {
        throw new Error('Configurações do Firebase Admin inválidas. Verifique as variáveis de ambiente.');
      }
      
      console.log('🔧 Usando credenciais de service account...');
      try {
        adminApp = initializeApp({
          credential: cert({
            projectId: firebaseAdminConfig.projectId,
            clientEmail: firebaseAdminConfig.clientEmail,
            privateKey: firebaseAdminConfig.privateKey,
          }),
          projectId: firebaseAdminConfig.projectId,
        });
        console.log('✅ Firebase Admin SDK inicializado com credenciais');
      } catch (error) {
        console.error('❌ Erro ao inicializar Firebase Admin SDK:', error);
        throw error;
      }
    } else {
      adminApp = getApps()[0];
      console.log('✅ Firebase Admin SDK já inicializado');
    }
  }
  return adminApp;
}

export const adminDb = () => getFirestore(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());
