// Script para criar dados de exemplo no Firebase
// Execute no console do navegador na página do Firebase Console

const sampleCategories = [
  {
    name: 'Política',
    slug: 'politica',
    description: 'Notícias sobre política local e nacional',
    color: '#3B82F6',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Esportes',
    slug: 'esportes',
    description: 'Notícias esportivas e eventos',
    color: '#10B981',
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Tecnologia',
    slug: 'tecnologia',
    description: 'Inovações e novidades tecnológicas',
    color: '#8B5CF6',
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Economia',
    slug: 'economia',
    description: 'Notícias econômicas e financeiras',
    color: '#F59E0B',
    order: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Cultura',
    slug: 'cultura',
    description: 'Eventos culturais e entretenimento',
    color: '#EF4444',
    order: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleNews = [
  {
    title: 'Nova política de transporte público é aprovada',
    subtitle: 'Medida visa melhorar a mobilidade urbana na cidade',
    content: 'A nova política de transporte público foi aprovada por unanimidade na câmara municipal. A medida inclui investimentos em infraestrutura, renovação da frota e melhorias na acessibilidade. O projeto tem previsão de implementação para o próximo semestre.',
    categoryId: '', // Será preenchido após criar as categorias
    tags: 'transporte, política, mobilidade',
    coverImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop',
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    views: 0,
    authorId: 'admin',
    authorName: 'Administrador'
  },
  {
    title: 'Time local vence campeonato estadual',
    subtitle: 'Vitória histórica garante vaga na próxima fase',
    content: 'O time local conquistou uma vitória histórica no campeonato estadual, garantindo vaga na próxima fase da competição. A partida foi decidida nos últimos minutos com um gol de falta. Os torcedores comemoraram nas ruas da cidade.',
    categoryId: '', // Será preenchido após criar as categorias
    tags: 'futebol, esporte, campeonato',
    coverImageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop',
    isPublished: true,
    isFeatured: false,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    views: 0,
    authorId: 'admin',
    authorName: 'Administrador'
  }
];

console.log('📝 Dados de exemplo criados!');
console.log('📋 Categorias:', sampleCategories);
console.log('📰 Notícias:', sampleNews);
console.log('');
console.log('💡 Para usar estes dados:');
console.log('1. Acesse o Firebase Console');
console.log('2. Vá para Firestore Database');
console.log('3. Crie as coleções "categories" e "news"');
console.log('4. Adicione os documentos com os dados acima');
