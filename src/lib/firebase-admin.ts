import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

export function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      // Em App Hosting, ADC é automático
      // Localmente, use GOOGLE_APPLICATION_CREDENTIALS
      if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        // Fallback para desenvolvimento local
        adminApp = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        // App Hosting usa ADC automaticamente
        adminApp = initializeApp();
      }
    } else {
      adminApp = getApps()[0];
    }
  }
  return adminApp;
}

export const adminDb = () => getFirestore(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());
