#!/usr/bin/env node

/**
 * Script para identificar e limpar banners com URLs inválidas
 * 
 * Este script:
 * 1. Lista todos os banners do Firestore
 * 2. Identifica banners com URLs inválidas (não começam com http)
 * 3. Oferece opções para deletar ou desativar esses banners
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Configuração do Firebase Admin
const serviceAccount = require('../src/lib/firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'aconexaogoias'
});

const db = admin.firestore();

// Interface para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Função para validar URL
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return false;
  }
  return url.startsWith('http://') || url.startsWith('https://');
}

// Função para verificar se a URL é acessível
async function isUrlAccessible(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Função principal
async function main() {
  try {
    console.log('🔍 Analisando banners no Firestore...\n');
    
    // Buscar todos os banners
    const bannersSnapshot = await db.collection('banners').get();
    
    if (bannersSnapshot.empty) {
      console.log('❌ Nenhum banner encontrado no banco de dados.');
      return;
    }
    
    console.log(`📊 Total de banners encontrados: ${bannersSnapshot.docs.length}\n`);
    
    const invalidBanners = [];
    const validBanners = [];
    const inaccessibleBanners = [];
    
    // Analisar cada banner
    for (const doc of bannersSnapshot.docs) {
      const data = doc.data();
      const banner = {
        id: doc.id,
        title: data.title || 'Sem título',
        image: data.image || '',
        isActive: data.isActive || false,
        position: data.position || 'unknown',
        createdAt: data.createdAt?.toDate() || new Date()
      };
      
      if (!isValidImageUrl(banner.image)) {
        invalidBanners.push(banner);
      } else {
        // Verificar se a URL é acessível
        const isAccessible = await isUrlAccessible(banner.image);
        if (isAccessible) {
          validBanners.push(banner);
        } else {
          inaccessibleBanners.push(banner);
        }
      }
    }
    
    // Mostrar resultados
    console.log('✅ Banners com URLs válidas e acessíveis:', validBanners.length);
    console.log('❌ Banners com URLs inválidas:', invalidBanners.length);
    console.log('⚠️  Banners com URLs válidas mas inacessíveis:', inaccessibleBanners.length);
    
    if (invalidBanners.length === 0 && inaccessibleBanners.length === 0) {
      console.log('\n🎉 Todos os banners têm URLs válidas e acessíveis!');
      rl.close();
      return;
    }
    
    const problemBanners = [...invalidBanners, ...inaccessibleBanners];
    
    console.log('\n📋 Banners com problemas:');
    console.log('─'.repeat(80));
    problemBanners.forEach((banner, index) => {
      const problemType = invalidBanners.includes(banner) ? 'URL Inválida' : 'URL Inacessível';
      console.log(`${index + 1}. ID: ${banner.id}`);
      console.log(`   Título: ${banner.title}`);
      console.log(`   Problema: ${problemType}`);
      console.log(`   URL: "${banner.image}"`);
      console.log(`   Posição: ${banner.position}`);
      console.log(`   Ativo: ${banner.isActive ? 'Sim' : 'Não'}`);
      console.log(`   Criado: ${banner.createdAt.toLocaleDateString('pt-BR')}`);
      console.log('');
    });
    
    // Opções de ação
    console.log('🔧 Opções disponíveis:');
    console.log('1. Deletar todos os banners com problemas');
    console.log('2. Desativar todos os banners com problemas');
    console.log('3. Deletar banners específicos');
    console.log('4. Sair sem fazer alterações');
    
    const choice = await question('\nEscolha uma opção (1-4): ');
    
    switch (choice) {
      case '1':
        await deleteAllInvalidBanners(problemBanners);
        break;
      case '2':
        await deactivateAllInvalidBanners(problemBanners);
        break;
      case '3':
        await deleteSpecificBanners(problemBanners);
        break;
      case '4':
        console.log('👋 Operação cancelada.');
        break;
      default:
        console.log('❌ Opção inválida.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar o script:', error);
  } finally {
    rl.close();
  }
}

// Deletar todos os banners inválidos
async function deleteAllInvalidBanners(invalidBanners) {
  const confirm = await question(`\n⚠️  Tem certeza que deseja deletar ${invalidBanners.length} banners? (digite 'SIM' para confirmar): `);
  
  if (confirm !== 'SIM') {
    console.log('❌ Operação cancelada.');
    return;
  }
  
  console.log('\n🗑️  Deletando banners...');
  
  for (const banner of invalidBanners) {
    try {
      await db.collection('banners').doc(banner.id).delete();
      console.log(`✅ Deletado: ${banner.title} (${banner.id})`);
    } catch (error) {
      console.error(`❌ Erro ao deletar ${banner.title}:`, error.message);
    }
  }
  
  console.log('\n🎉 Operação concluída!');
}

// Desativar todos os banners inválidos
async function deactivateAllInvalidBanners(invalidBanners) {
  const confirm = await question(`\n⚠️  Tem certeza que deseja desativar ${invalidBanners.length} banners? (digite 'SIM' para confirmar): `);
  
  if (confirm !== 'SIM') {
    console.log('❌ Operação cancelada.');
    return;
  }
  
  console.log('\n🔒 Desativando banners...');
  
  for (const banner of invalidBanners) {
    try {
      await db.collection('banners').doc(banner.id).update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Desativado: ${banner.title} (${banner.id})`);
    } catch (error) {
      console.error(`❌ Erro ao desativar ${banner.title}:`, error.message);
    }
  }
  
  console.log('\n🎉 Operação concluída!');
}

// Deletar banners específicos
async function deleteSpecificBanners(invalidBanners) {
  console.log('\n📝 Digite os números dos banners que deseja deletar (separados por vírgula):');
  
  const input = await question('Números: ');
  const indices = input.split(',').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < invalidBanners.length);
  
  if (indices.length === 0) {
    console.log('❌ Nenhum banner válido selecionado.');
    return;
  }
  
  const selectedBanners = indices.map(i => invalidBanners[i]);
  
  console.log('\n📋 Banners selecionados para deleção:');
  selectedBanners.forEach((banner, index) => {
    console.log(`${index + 1}. ${banner.title} (${banner.id})`);
  });
  
  const confirm = await question(`\n⚠️  Tem certeza que deseja deletar ${selectedBanners.length} banners? (digite 'SIM' para confirmar): `);
  
  if (confirm !== 'SIM') {
    console.log('❌ Operação cancelada.');
    return;
  }
  
  console.log('\n🗑️  Deletando banners selecionados...');
  
  for (const banner of selectedBanners) {
    try {
      await db.collection('banners').doc(banner.id).delete();
      console.log(`✅ Deletado: ${banner.title} (${banner.id})`);
    } catch (error) {
      console.error(`❌ Erro ao deletar ${banner.title}:`, error.message);
    }
  }
  
  console.log('\n🎉 Operação concluída!');
}

// Executar o script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, isValidImageUrl };
