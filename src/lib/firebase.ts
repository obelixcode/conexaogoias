import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { firebaseConfig, validateFirebaseConfig } from "./firebase-config";

// Validar configurações antes de inicializar (apenas avisar em desenvolvimento)
const isConfigValid = validateFirebaseConfig();
if (!isConfigValid && process.env.NODE_ENV === 'production') {
  throw new Error('Configurações do Firebase inválidas. Verifique as variáveis de ambiente.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configurar emuladores apenas se explicitamente habilitados
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true' && typeof window !== 'undefined') {
  try {
    // Conectar emuladores apenas se não estiverem já conectados
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ Emuladores do Firebase conectados');
  } catch (error) {
    // Emuladores já conectados ou não disponíveis
    console.log('Emuladores não configurados ou já conectados');
  }
} else {
  console.log('✅ Firebase configurado para produção');
}

export default app;
