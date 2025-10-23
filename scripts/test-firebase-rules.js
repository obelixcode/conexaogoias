#!/usr/bin/env node

/**
 * Script para testar as regras do Firebase
 * Verifica se as regras estão sintaticamente corretas
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testando regras do Firebase...\n');

// Verificar se o Firebase CLI está instalado
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI encontrado');
} catch (error) {
  console.error('❌ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools');
  process.exit(1);
}

// Verificar se estamos no diretório correto
if (!fs.existsSync('firebase.json')) {
  console.error('❌ firebase.json não encontrado. Execute este script na raiz do projeto.');
  process.exit(1);
}

console.log('✅ firebase.json encontrado');

// Verificar arquivos de regras
const rulesFiles = [
  'firestore.rules',
  'storage.rules',
  'firestore.indexes.json'
];

console.log('\n📋 Verificando arquivos de regras:');

rulesFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
    
    // Verificar sintaxe básica
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      if (file.endsWith('.json')) {
        JSON.parse(content);
        console.log(`✅ ${file} - JSON válido`);
      } else if (file.endsWith('.rules')) {
        // Verificação básica de sintaxe das regras
        if (content.includes('rules_version') && content.includes('service')) {
          console.log(`✅ ${file} - Estrutura básica válida`);
        } else {
          console.log(`⚠️  ${file} - Estrutura pode estar incorreta`);
        }
      }
    } catch (error) {
      console.log(`❌ ${file} - Erro de sintaxe: ${error.message}`);
    }
  } else {
    console.log(`❌ ${file} não encontrado`);
  }
});

console.log('\n🚀 Testando deploy das regras...');

try {
  // Testar se as regras podem ser validadas
  console.log('📤 Validando regras do Firestore...');
  execSync('firebase firestore:rules:validate', { stdio: 'pipe' });
  console.log('✅ Regras do Firestore válidas');
} catch (error) {
  console.log('❌ Erro nas regras do Firestore:', error.message);
}

try {
  console.log('📤 Validando regras do Storage...');
  execSync('firebase storage:rules:validate', { stdio: 'pipe' });
  console.log('✅ Regras do Storage válidas');
} catch (error) {
  console.log('❌ Erro nas regras do Storage:', error.message);
}

try {
  console.log('📤 Validando índices do Firestore...');
  execSync('firebase firestore:indexes:validate', { stdio: 'pipe' });
  console.log('✅ Índices do Firestore válidos');
} catch (error) {
  console.log('❌ Erro nos índices do Firestore:', error.message);
}

console.log('\n🎉 Teste concluído!');
console.log('\n📝 Próximos passos:');
console.log('1. Execute: firebase deploy --only firestore:rules');
console.log('2. Execute: firebase deploy --only storage:rules');
console.log('3. Execute: firebase deploy --only firestore:indexes');
console.log('\n⚠️  IMPORTANTE: Teste as regras em ambiente de desenvolvimento antes de fazer deploy em produção!');
