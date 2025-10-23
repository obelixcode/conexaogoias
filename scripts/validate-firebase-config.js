#!/usr/bin/env node

/**
 * Script para validar configuração do Firebase
 * 
 * Uso:
 * node scripts/validate-firebase-config.js
 * 
 * Este script verifica se todas as variáveis de ambiente do Firebase estão configuradas
 * e se as credenciais são válidas.
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envFiles = ['.env.local', '.env.production', '.env'];
  let envFile = null;
  
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      envFile = file;
      break;
    }
  }
  
  if (!envFile) {
    log('❌ Nenhum arquivo .env encontrado', 'red');
    log('📋 Arquivos procurados: .env.local, .env.production, .env', 'yellow');
    return null;
  }
  
  log(`✅ Arquivo .env encontrado: ${envFile}`, 'green');
  return envFile;
}

function loadEnvFile(envFile) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

function validateFirebaseConfig(envVars) {
  log('\n🔧 Validando configuração do Firebase...', 'cyan');
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missingVars = [];
  const placeholderVars = [];
  
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    
    if (!value) {
      missingVars.push(varName);
      log(`❌ ${varName}: não encontrada`, 'red');
    } else if (value.includes('123456789') || value.includes('abcdef123456') || value.includes('your-')) {
      placeholderVars.push(varName);
      log(`⚠️  ${varName}: valor placeholder detectado`, 'yellow');
    } else {
      log(`✅ ${varName}: configurada`, 'green');
    }
  });
  
  if (missingVars.length > 0) {
    log('\n❌ Variáveis obrigatórias não encontradas:', 'red');
    missingVars.forEach(varName => {
      log(`   - ${varName}`, 'red');
    });
  }
  
  if (placeholderVars.length > 0) {
    log('\n⚠️  Variáveis com valores placeholder:', 'yellow');
    placeholderVars.forEach(varName => {
      log(`   - ${varName}`, 'yellow');
    });
    log('   Substitua pelos valores reais do Firebase Console', 'yellow');
  }
  
  return {
    isValid: missingVars.length === 0 && placeholderVars.length === 0,
    missing: missingVars,
    placeholders: placeholderVars
  };
}

function validateFirebaseAdminConfig(envVars) {
  log('\n🔐 Validando configuração do Firebase Admin...', 'cyan');
  
  const requiredAdminVars = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'FIREBASE_ADMIN_CLIENT_EMAIL'
  ];
  
  const missingAdminVars = [];
  const placeholderAdminVars = [];
  
  requiredAdminVars.forEach(varName => {
    const value = envVars[varName];
    
    if (!value) {
      missingAdminVars.push(varName);
      log(`❌ ${varName}: não encontrada`, 'red');
    } else if (value.includes('your-') || value.includes('xxxxx')) {
      placeholderAdminVars.push(varName);
      log(`⚠️  ${varName}: valor placeholder detectado`, 'yellow');
    } else {
      log(`✅ ${varName}: configurada`, 'green');
    }
  });
  
  // Verificar se a chave privada parece válida
  if (envVars.FIREBASE_ADMIN_PRIVATE_KEY) {
    const privateKey = envVars.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
      log('⚠️  FIREBASE_ADMIN_PRIVATE_KEY: formato pode estar incorreto', 'yellow');
    }
  }
  
  if (missingAdminVars.length > 0) {
    log('\n❌ Variáveis do Firebase Admin não encontradas:', 'red');
    missingAdminVars.forEach(varName => {
      log(`   - ${varName}`, 'red');
    });
  }
  
  if (placeholderAdminVars.length > 0) {
    log('\n⚠️  Variáveis do Firebase Admin com valores placeholder:', 'yellow');
    placeholderAdminVars.forEach(varName => {
      log(`   - ${varName}`, 'yellow');
    });
  }
  
  return {
    isValid: missingAdminVars.length === 0 && placeholderAdminVars.length === 0,
    missing: missingAdminVars,
    placeholders: placeholderAdminVars
  };
}

function generateReport(firebaseResult, adminResult) {
  log('\n📊 RELATÓRIO DE VALIDAÇÃO', 'bright');
  log('='.repeat(50), 'cyan');
  
  if (firebaseResult.isValid && adminResult.isValid) {
    log('✅ Todas as configurações estão válidas!', 'green');
    log('🚀 Você pode prosseguir com o deploy.', 'green');
  } else {
    log('❌ Configurações inválidas encontradas:', 'red');
    
    if (!firebaseResult.isValid) {
      log('\n🔧 Firebase Client:', 'yellow');
      if (firebaseResult.missing.length > 0) {
        log('   Variáveis faltando:', 'red');
        firebaseResult.missing.forEach(varName => {
          log(`   - ${varName}`, 'red');
        });
      }
      if (firebaseResult.placeholders.length > 0) {
        log('   Variáveis com placeholder:', 'yellow');
        firebaseResult.placeholders.forEach(varName => {
          log(`   - ${varName}`, 'yellow');
        });
      }
    }
    
    if (!adminResult.isValid) {
      log('\n🔐 Firebase Admin:', 'yellow');
      if (adminResult.missing.length > 0) {
        log('   Variáveis faltando:', 'red');
        adminResult.missing.forEach(varName => {
          log(`   - ${varName}`, 'red');
        });
      }
      if (adminResult.placeholders.length > 0) {
        log('   Variáveis com placeholder:', 'yellow');
        adminResult.placeholders.forEach(varName => {
          log(`   - ${varName}`, 'yellow');
        });
      }
    }
  }
  
  log('\n📚 PRÓXIMOS PASSOS:', 'cyan');
  log('1. Acesse: https://console.firebase.google.com/project/aconexaogoias/settings/general', 'blue');
  log('2. Copie as credenciais REAIS (não use placeholders)', 'blue');
  log('3. Configure as variáveis de ambiente na VPS', 'blue');
  log('4. Adicione o domínio em Authentication > Settings > Authorized domains', 'blue');
  log('5. Crie um usuário em Authentication > Users', 'blue');
  log('6. Crie um documento no Firestore em users/[uid] com role: admin', 'blue');
}

function main() {
  log('🔍 VALIDADOR DE CONFIGURAÇÃO FIREBASE', 'bright');
  log('='.repeat(50), 'cyan');
  
  // Verificar arquivo .env
  const envFile = checkEnvFile();
  if (!envFile) {
    process.exit(1);
  }
  
  // Carregar variáveis de ambiente
  const envVars = loadEnvFile(envFile);
  
  // Validar configurações
  const firebaseResult = validateFirebaseConfig(envVars);
  const adminResult = validateFirebaseAdminConfig(envVars);
  
  // Gerar relatório
  generateReport(firebaseResult, adminResult);
  
  // Exit code baseado na validação
  if (firebaseResult.isValid && adminResult.isValid) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateFirebaseConfig,
  validateFirebaseAdminConfig,
  checkEnvFile,
  loadEnvFile
};
