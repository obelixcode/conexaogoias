const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config (same as in your project)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "AIzaSyBvQZvQZvQZvQZvQZvQZvQZvQZvQZvQZvQ",
  authDomain: "aconexaogoias.firebaseapp.com",
  projectId: "aconexaogoias",
  storageBucket: "aconexaogoias.appspot.com",
  messagingSenderId: "6509088743",
  appId: "1:6509088743:web:1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleCategories = [
  {
    name: 'Política',
    slug: 'politica',
    description: 'Notícias sobre política local e nacional',
    color: '#3B82F6',
    order: 1,
    isActive: true
  },
  {
    name: 'Esportes',
    slug: 'esportes',
    description: 'Notícias esportivas e eventos',
    color: '#10B981',
    order: 2,
    isActive: true
  },
  {
    name: 'Tecnologia',
    slug: 'tecnologia',
    description: 'Inovações e novidades tecnológicas',
    color: '#8B5CF6',
    order: 3,
    isActive: true
  },
  {
    name: 'Economia',
    slug: 'economia',
    description: 'Notícias econômicas e financeiras',
    color: '#F59E0B',
    order: 4,
    isActive: true
  },
  {
    name: 'Cultura',
    slug: 'cultura',
    description: 'Eventos culturais e entretenimento',
    color: '#EF4444',
    order: 5,
    isActive: true
  }
];

async function seedCategories() {
  try {
    console.log('🌱 Iniciando seed de categorias...');
    
    for (const category of sampleCategories) {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Categoria "${category.name}" criada com ID: ${docRef.id}`);
    }
    
    console.log('🎉 Seed de categorias concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seedCategories();
