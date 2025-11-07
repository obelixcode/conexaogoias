#!/usr/bin/env node

/**
 * Script de validação de variáveis de ambiente para Firebase App Hosting
 * 
 * Este script valida se todas as variáveis de ambiente necessárias estão
 * configuradas e se os valores são válidos.
 */

// Carregar variáveis de ambiente do arquivo .env.local se existir
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envProductionPath = path.join(process.cwd(), '.env.production');

// Função para carregar arquivo .env
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

// Carregar .env.local primeiro (desenvolvimento)
loadEnvFile(envLocalPath);
// Carregar .env.production depois (produção - sobrescreve se existir)
loadEnvFile(envProductionPath);

const requiredEnvVars = {
  // Firebase Client (NEXT_PUBLIC_*)
  'NEXT_PUBLIC_FIREBASE_API_KEY': {
    description: 'Chave da API do Firebase',
    validate: (value) => value && value.length > 20 && !value.includes('demo'),
  },
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': {
    description: 'Domínio de autenticação do Firebase',
    validate: (value) => value && value.includes('.firebaseapp.com'),
  },
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': {
    description: 'ID do projeto Firebase',
    validate: (value) => value && value.length > 0 && !value.includes('demo'),
  },
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': {
    description: 'Bucket de storage do Firebase',
    validate: (value) => value && value.includes('.firebasestorage.app'),
  },
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': {
    description: 'ID do remetente de mensagens',
    validate: (value) => value && value.length > 0 && !value.includes('123456789'),
  },
  'NEXT_PUBLIC_FIREBASE_APP_ID': {
    description: 'ID da aplicação web',
    validate: (value) => value && value.length > 10 && !value.includes('demo'),
  },
  // Firebase Admin (FIREBASE_ADMIN_*)
  'FIREBASE_ADMIN_PROJECT_ID': {
    description: 'ID do projeto Firebase (Admin)',
    validate: (value) => value && value.length > 0 && !value.includes('demo'),
    optional: true, // Pode usar NEXT_PUBLIC_FIREBASE_PROJECT_ID como fallback
  },
  'FIREBASE_ADMIN_CLIENT_EMAIL': {
    description: 'Email da conta de serviço Firebase Admin',
    validate: (value) => value && value.includes('@') && value.includes('.iam.gserviceaccount.com'),
  },
  'FIREBASE_ADMIN_PRIVATE_KEY': {
    description: 'Chave privada da conta de serviço Firebase Admin',
    validate: (value) => {
      if (!value) return false;
      const key = value.replace(/\\n/g, '\n');
      return key.includes('BEGIN PRIVATE KEY') && key.includes('END PRIVATE KEY');
    },
  },
};

const optionalEnvVars = {
  'NEXT_PUBLIC_APP_URL': {
    description: 'URL base da aplicação',
    validate: (value) => !value || (value.startsWith('http://') || value.startsWith('https://')),
  },
  'NEXT_PUBLIC_SITE_URL': {
    description: 'URL do site',
    validate: (value) => !value || (value.startsWith('http://') || value.startsWith('https://')),
  },
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvVars() {
  log('\n🔍 Validando variáveis de ambiente para Firebase App Hosting...\n', 'blue');
  
  let hasErrors = false;
  let hasWarnings = false;
  const missing = [];
  const invalid = [];
  const warnings = [];

  // Validar variáveis obrigatórias
  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[varName];
    
    // Verificar se está presente
    if (!value) {
      // Se é opcional e tem fallback, verificar o fallback
      if (config.optional && varName === 'FIREBASE_ADMIN_PROJECT_ID') {
        const fallback = process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
        if (fallback) {
          log(`⚠️  ${varName}: não configurada, usando NEXT_PUBLIC_FIREBASE_PROJECT_ID como fallback`, 'yellow');
          warnings.push(`${varName} usando fallback`);
          continue;
        }
      }
      
      missing.push(varName);
      log(`❌ ${varName}: NÃO CONFIGURADA`, 'red');
      log(`   Descrição: ${config.description}`, 'red');
      hasErrors = true;
      continue;
    }

    // Validar valor
    if (config.validate && !config.validate(value)) {
      invalid.push(varName);
      log(`❌ ${varName}: VALOR INVÁLIDO`, 'red');
      log(`   Descrição: ${config.description}`, 'red');
      log(`   Valor atual: ${value.substring(0, 50)}...`, 'red');
      hasErrors = true;
      continue;
    }

    // Valor válido
    log(`✅ ${varName}: OK`, 'green');
  }

  // Validar variáveis opcionais
  log('\n📋 Variáveis opcionais:', 'blue');
  for (const [varName, config] of Object.entries(optionalEnvVars)) {
    const value = process.env[varName];
    
    if (!value) {
      log(`⚠️  ${varName}: não configurada (opcional)`, 'yellow');
      warnings.push(`${varName} não configurada (opcional)`);
      continue;
    }

    if (config.validate && !config.validate(value)) {
      log(`⚠️  ${varName}: valor inválido (opcional)`, 'yellow');
      warnings.push(`${varName} valor inválido (opcional)`);
      continue;
    }

    log(`✅ ${varName}: OK`, 'green');
  }

  // Resumo
  log('\n📊 Resumo da validação:', 'blue');
  
  if (hasErrors) {
    log('\n❌ ERROS ENCONTRADOS:', 'red');
    if (missing.length > 0) {
      log(`   Variáveis faltando: ${missing.length}`, 'red');
      missing.forEach(v => log(`   - ${v}`, 'red'));
    }
    if (invalid.length > 0) {
      log(`   Variáveis inválidas: ${invalid.length}`, 'red');
      invalid.forEach(v => log(`   - ${v}`, 'red'));
    }
    log('\n❌ Validação FALHOU. Configure as variáveis de ambiente antes do deploy.', 'red');
    process.exit(1);
  }

  if (hasWarnings || warnings.length > 0) {
    log('\n⚠️  AVISOS:', 'yellow');
    warnings.forEach(w => log(`   - ${w}`, 'yellow'));
  }

  log('\n✅ Validação PASSOU! Todas as variáveis obrigatórias estão configuradas corretamente.', 'green');
  log('\n📝 Próximos passos:', 'blue');
  log('   1. Configure as variáveis opcionais se necessário', 'blue');
  log('   2. Execute: npm run build (para testar o build local)', 'blue');
  log('   3. Execute: npm run deploy:hosting (para fazer o deploy)', 'blue');
  log('');
  
  process.exit(0);
}

// Executar validação
try {
  validateEnvVars();
} catch (error) {
  log(`\n❌ Erro ao validar variáveis de ambiente: ${error.message}`, 'red');
  process.exit(1);
}

