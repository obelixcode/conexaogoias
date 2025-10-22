const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../src/lib/firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
});

const db = admin.firestore();

async function seedSettings() {
  try {
    console.log('🌱 Iniciando seed das configurações do site...');

    const settingsData = {
      siteName: 'Conexão Goiás',
      siteDescription: 'Portal de notícias de Goiás. Informação confiável e atualizada.',
      siteUrl: 'https://conexaogoias.com',
      contactEmail: 'contato@conexaogoias.com',
      adminEmail: 'admin@conexaogoias.com',
      phone1: '(62) 99999-9999',
      phone2: '(62) 3333-3333',
      address: 'Rua das Flores, 123\nCentro - Goiânia/GO',
      socialMedia: {
        facebook: 'https://facebook.com/conexaogoias',
        twitter: 'https://twitter.com/conexaogoias',
        instagram: 'https://instagram.com/conexaogoias',
        youtube: 'https://youtube.com/@conexaogoias',
        whatsapp: 'https://wa.me/5562999999999'
      },
      twitterHandle: '@conexaogoias',
      foundingYear: new Date().getFullYear(),
      faviconUrl: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Salvar configurações
    await db.collection('settings').doc('site').set(settingsData);

    console.log('✅ Configurações do site criadas com sucesso!');
    console.log('📋 Dados configurados:');
    console.log(`   - Nome: ${settingsData.siteName}`);
    console.log(`   - URL: ${settingsData.siteUrl}`);
    console.log(`   - E-mail de contato: ${settingsData.contactEmail}`);
    console.log(`   - E-mail admin: ${settingsData.adminEmail}`);
    console.log(`   - Ano de fundação: ${settingsData.foundingYear}`);
    console.log(`   - Redes sociais: ${Object.keys(settingsData.socialMedia).length} configuradas`);

  } catch (error) {
    console.error('❌ Erro ao criar configurações:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar seed
seedSettings();
