import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

// Configuração do Firebase Admin SDK
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')?.replace(/^"|"$/g, ''),
};

// Verificar se temos todas as variáveis de ambiente necessárias
const hasEnvVars = firebaseAdminConfig.projectId && 
                   firebaseAdminConfig.clientEmail && 
                   firebaseAdminConfig.privateKey;

// Inicializar Firebase Admin apenas uma vez
let adminApp;
if (getApps().length === 0) {
  // Priorizar variáveis de ambiente (para App Hosting e produção)
  if (hasEnvVars) {
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
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase Admin SDK com variáveis de ambiente:', error);
      // Fallback: tentar usar arquivo de credenciais JSON (para desenvolvimento local)
      try {
        const serviceAccountPath = path.join(process.cwd(), 'aconexaogoias-firebase-adminsdk-fbsvc-52aa2cb5ec.json');
        adminApp = initializeApp({
          credential: cert(serviceAccountPath),
          projectId: firebaseAdminConfig.projectId,
        });
        console.log('✅ Firebase Admin SDK inicializado com arquivo de credenciais (fallback)');
      } catch (fallbackError) {
        console.error('❌ Erro no fallback para arquivo JSON:', fallbackError);
        // Último recurso: usar configuração padrão
        adminApp = initializeApp({
          projectId: firebaseAdminConfig.projectId,
        });
        console.log('⚠️ Firebase Admin SDK inicializado sem credenciais (modo limitado)');
      }
    }
  } else {
    // Se não temos variáveis de ambiente, tentar arquivo JSON (desenvolvimento local)
    try {
      const serviceAccountPath = path.join(process.cwd(), 'aconexaogoias-firebase-adminsdk-fbsvc-52aa2cb5ec.json');
      adminApp = initializeApp({
        credential: cert(serviceAccountPath),
        projectId: firebaseAdminConfig.projectId,
      });
      console.log('✅ Firebase Admin SDK inicializado com arquivo de credenciais (desenvolvimento local)');
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase Admin SDK com arquivo JSON:', error);
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
