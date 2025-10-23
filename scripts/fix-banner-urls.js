const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inicializar Firebase Admin
const app = initializeApp({
  credential: cert(require('../aconexaogoias-firebase-adminsdk-fbsvc-52aa2cb5ec.json'))
});

const db = getFirestore(app);

async function fixBannerUrls() {
  try {
    console.log('🔍 Verificando URLs dos banners...');
    
    const bannersRef = db.collection('banners');
    const snapshot = await bannersRef.get();
    
    if (snapshot.empty) {
      console.log('❌ Nenhum banner encontrado');
      return;
    }
    
    console.log(`📊 Encontrados ${snapshot.docs.length} banners`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const doc of snapshot.docs) {
      const banner = doc.data();
      const bannerId = doc.id;
      
      console.log(`\n🔍 Verificando banner: ${banner.title} (${bannerId})`);
      console.log(`   URL atual: ${banner.image}`);
      
      // Verificar se a URL é válida
      const isValidUrl = (url) => {
        if (!url || !url.trim()) return false;
        try {
          const urlObj = new URL(url);
          return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
          return false;
        }
      };
      
      // Função para corrigir URL
      const fixUrl = (url) => {
        if (!url) return url;
        
        // Se já é uma URL válida, retornar como está
        if (isValidUrl(url)) {
          return url;
        }
        
        // Se contém apenas o ID do arquivo, tentar construir a URL
        if (url.length > 10 && !url.includes('://')) {
          return `https://firebasestorage.googleapis.com/v0/b/aconexaogoias.firebasestorage.app/o/${encodeURIComponent(url)}?alt=media`;
        }
        
        return url;
      };
      
      const originalUrl = banner.image;
      const fixedUrl = fixUrl(originalUrl);
      
      if (originalUrl !== fixedUrl && isValidUrl(fixedUrl)) {
        try {
          await doc.ref.update({
            image: fixedUrl,
            updatedAt: new Date()
          });
          
          console.log(`✅ URL corrigida: ${fixedUrl}`);
          fixedCount++;
        } catch (error) {
          console.error(`❌ Erro ao atualizar banner ${bannerId}:`, error.message);
          errorCount++;
        }
      } else if (!isValidUrl(originalUrl)) {
        console.log(`⚠️  URL inválida não pode ser corrigida automaticamente: ${originalUrl}`);
        errorCount++;
      } else {
        console.log(`✅ URL já está correta`);
      }
    }
    
    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ URLs corrigidas: ${fixedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📊 Total processados: ${snapshot.docs.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao processar banners:', error);
  }
}

// Executar o script
fixBannerUrls()
  .then(() => {
    console.log('\n🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });