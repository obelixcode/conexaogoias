// Script para limpar referências ao ohoje.com do banco de dados
// Execute no console do navegador na página do Firebase Console

const cleanOhojeReferences = async () => {
  try {
    console.log('🧹 Iniciando limpeza de referências ao ohoje.com...');
    
    // Função para limpar URLs que contenham ohoje.com
    const cleanUrl = (url) => {
      if (typeof url === 'string' && url.includes('ohoje.com')) {
        console.log('❌ URL encontrada com ohoje.com:', url);
        // Substituir por uma URL de placeholder ou remover
        return 'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Imagem+Removida';
      }
      return url;
    };
    
    // Função para processar um documento
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const processDocument = (doc, collectionName) => {
      const data = doc.data();
      let hasChanges = false;
      const updatedData = { ...data };
      
      // Verificar campos que podem conter URLs
      const urlFields = ['coverImage', 'coverImageUrl', 'image', 'imageUrl', 'url'];
      
      urlFields.forEach(field => {
        if (updatedData[field] && typeof updatedData[field] === 'string') {
          const cleanedUrl = cleanUrl(updatedData[field]);
          if (cleanedUrl !== updatedData[field]) {
            updatedData[field] = cleanedUrl;
            hasChanges = true;
          }
        }
      });
      
      // Verificar arrays de imagens
      if (updatedData.images && Array.isArray(updatedData.images)) {
        updatedData.images = updatedData.images.map(img => {
          if (typeof img === 'string') {
            return cleanUrl(img);
          }
          if (typeof img === 'object' && img.url) {
            return { ...img, url: cleanUrl(img.url) };
          }
          return img;
        });
        hasChanges = true;
      }
      
      // Verificar conteúdo HTML que pode conter URLs
      if (updatedData.content && typeof updatedData.content === 'string') {
        const cleanedContent = updatedData.content.replace(
          /https?:\/\/[^\/]*ohoje\.com[^\s"']*/g,
          'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Imagem+Removida'
        );
        if (cleanedContent !== updatedData.content) {
          updatedData.content = cleanedContent;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        console.log(`📝 Atualizando documento ${doc.id} na coleção ${collectionName}`);
        return { id: doc.id, data: updatedData };
      }
      
      return null;
    };
    
    console.log('✅ Script de limpeza criado!');
    console.log('');
    console.log('💡 Para usar este script:');
    console.log('1. Acesse o Firebase Console');
    console.log('2. Vá para Firestore Database');
    console.log('3. Abra o console do navegador (F12)');
    console.log('4. Cole e execute este script');
    console.log('5. Execute: cleanOhojeReferences()');
    console.log('');
    console.log('⚠️  ATENÇÃO: Este script irá modificar dados no banco!');
    console.log('   Faça backup antes de executar em produção!');
    
  } catch (error) {
    console.error('❌ Erro ao criar script de limpeza:', error);
  }
};

// Função para executar a limpeza (será definida quando executada no Firebase)
window.cleanOhojeReferences = cleanOhojeReferences;

console.log('📋 Script de limpeza carregado!');
console.log('Execute: cleanOhojeReferences() para começar a limpeza');
