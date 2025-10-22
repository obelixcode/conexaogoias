import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
