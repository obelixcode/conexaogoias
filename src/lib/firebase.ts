import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { firebaseConfig, validateFirebaseConfig } from "./firebase-config";

// Validar configurações antes de inicializar
if (!validateFirebaseConfig()) {
  throw new Error('Configurações do Firebase inválidas. Verifique as variáveis de ambiente.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configurar emuladores em desenvolvimento (se necessário)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Só conectar emuladores se não estiverem já conectados
    if (!auth._delegate._config?.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    if (!db._delegate._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    if (!storage._delegate._host?.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    // Emuladores já conectados ou não disponíveis
    console.log('Emuladores não configurados ou já conectados');
  }
}

export default app;
