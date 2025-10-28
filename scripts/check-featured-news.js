#!/usr/bin/env node

// Script para verificar e inicializar notícias em destaque
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } = require('firebase/firestore');

// Configuração do Firebase (usando as mesmas variáveis do .env.production)
const firebaseConfig = {
  apiKey: "AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM",
  authDomain: "aconexaogoias.firebaseapp.com",
  projectId: "aconexaogoias",
  storageBucket: "aconexaogoias.firebasestorage.app",
  messagingSenderId: "6509088743",
  appId: "1:6509088743:web:f1866c676e18c53204f742"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFeaturedNewsConfig() {
  try {
    console.log('🔍 Verificando configuração de notícias em destaque...');
    
    // Verificar se existe a configuração
    const configDoc = await getDoc(doc(db, 'featured_news_config', 'current'));
    
    if (!configDoc.exists()) {
      console.log('❌ Configuração de notícias em destaque não encontrada');
      
      // Buscar as 5 notícias mais recentes publicadas
      console.log('📰 Buscando notícias publicadas...');
      const newsQuery = query(
        collection(db, 'news'),
        where('isPublished', '==', true),
        orderBy('publishedAt', 'desc')
      );
      
      const newsSnapshot = await getDocs(newsQuery);
      const recentNews = [];
      
      newsSnapshot.forEach((doc) => {
        recentNews.push({
          id: doc.id,
          title: doc.data().title,
          publishedAt: doc.data().publishedAt
        });
      });
      
      console.log(`📋 Encontradas ${recentNews.length} notícias publicadas`);
      
      if (recentNews.length > 0) {
        // Pegar as primeiras 5
        const newsIds = recentNews.slice(0, 5).map(news => news.id);
        
        console.log('✅ Criando configuração inicial com as 5 notícias mais recentes:');
        newsIds.forEach((id, index) => {
          const news = recentNews.find(n => n.id === id);
          console.log(`   ${index + 1}. ${news.title} (${id})`);
        });
        
        // Criar configuração
        await setDoc(doc(db, 'featured_news_config', 'current'), {
          newsIds: newsIds,
          updatedAt: new Date(),
          updatedBy: 'system-initialization',
          cacheBuster: Date.now()
        });
        
        console.log('🎉 Configuração inicial criada com sucesso!');
      } else {
        console.log('⚠️ Nenhuma notícia publicada encontrada. Configure notícias primeiro.');
      }
    } else {
      const config = configDoc.data();
      console.log('✅ Configuração encontrada:');
      console.log(`   📅 Última atualização: ${config.updatedAt.toDate()}`);
      console.log(`   👤 Atualizado por: ${config.updatedBy}`);
      console.log(`   📰 Notícias em destaque: ${config.newsIds.length}`);
      
      if (config.newsIds.length > 0) {
        console.log('   📋 IDs das notícias:');
        config.newsIds.forEach((id, index) => {
          console.log(`      ${index + 1}. ${id}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar configuração:', error);
  }
}

// Executar
checkFeaturedNewsConfig().then(() => {
  console.log('✅ Verificação concluída');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
