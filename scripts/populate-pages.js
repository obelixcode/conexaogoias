const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuração do Firebase (usar as mesmas variáveis de ambiente)
const firebaseConfig = {
  apiKey: "AIzaSyBvQZvQZvQZvQZvQZvQZvQZvQZvQZvQZvQ",
  authDomain: "aconexaogoias.firebaseapp.com",
  projectId: "aconexaogoias",
  storageBucket: "aconexaogoias.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dados de exemplo para páginas
const samplePages = [
  {
    title: 'Política de Privacidade',
    slug: 'politica-privacidade',
    content: '<h2>Política de Privacidade</h2><p>Esta é nossa política de privacidade. Aqui explicamos como coletamos, usamos e protegemos suas informações pessoais.</p><h3>Informações que Coletamos</h3><p>Coletamos informações que você nos fornece diretamente, como quando você se cadastra em nosso site ou entra em contato conosco.</p>',
    status: 'published',
    type: 'footer',
    footerType: 'privacy',
    metaDescription: 'Política de privacidade do site Conexão Goiás',
    seoTitle: 'Política de Privacidade - Conexão Goiás',
    author: 'Admin'
  },
  {
    title: 'Termos de Uso',
    slug: 'termos-uso',
    content: '<h2>Termos de Uso</h2><p>Estes termos de uso regem o uso do nosso site. Ao acessar e usar este site, você concorda em cumprir estes termos.</p><h3>Uso Aceitável</h3><p>Você concorda em usar o site apenas para fins legais e de acordo com estes termos.</p>',
    status: 'published',
    type: 'footer',
    footerType: 'terms',
    metaDescription: 'Termos de uso do site Conexão Goiás',
    seoTitle: 'Termos de Uso - Conexão Goiás',
    author: 'Admin'
  },
  {
    title: 'Sobre Nós',
    slug: 'sobre-nos',
    content: '<h2>Sobre a Conexão Goiás</h2><p>Somos uma empresa dedicada a conectar pessoas e informações em Goiás. Nossa missão é facilitar o acesso à informação de qualidade.</p><h3>Nossa História</h3><p>Fundada em 2020, a Conexão Goiás tem crescido constantemente, sempre priorizando a qualidade do conteúdo e o atendimento ao cliente.</p>',
    status: 'published',
    type: 'footer',
    footerType: 'about',
    metaDescription: 'Conheça mais sobre a Conexão Goiás',
    seoTitle: 'Sobre Nós - Conexão Goiás',
    author: 'Admin'
  },
  {
    title: 'Contato',
    slug: 'contato',
    content: '<h2>Entre em Contato</h2><p>Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo.</p><h3>Informações de Contato</h3><p><strong>Telefone:</strong> (62) 99999-9999</p><p><strong>Email:</strong> contato@conexaogoias.com</p><p><strong>Endereço:</strong> Goiânia, GO</p>',
    status: 'draft',
    type: 'footer',
    footerType: 'contact',
    metaDescription: 'Entre em contato com a Conexão Goiás',
    seoTitle: 'Contato - Conexão Goiás',
    author: 'Admin'
  },
  {
    title: 'Página Inicial',
    slug: 'home',
    content: '<h1>Bem-vindo à Conexão Goiás</h1><p>Seu portal de notícias e informações em Goiás. Aqui você encontra as principais notícias, eventos e informações da região.</p><h2>Últimas Notícias</h2><p>Fique por dentro das principais notícias de Goiás e região.</p>',
    status: 'published',
    type: 'general',
    metaDescription: 'Portal de notícias e informações de Goiás',
    seoTitle: 'Conexão Goiás - Notícias de Goiás',
    author: 'Admin'
  }
];

async function populatePages() {
  try {
    console.log('Iniciando população do Firestore com páginas de exemplo...');
    
    for (const page of samplePages) {
      const pageData = {
        ...page,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'pages'), pageData);
      console.log(`Página criada com ID: ${docRef.id}`);
    }
    
    console.log('✅ Todas as páginas foram criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar páginas:', error);
  }
}

// Executar o script
populatePages();
