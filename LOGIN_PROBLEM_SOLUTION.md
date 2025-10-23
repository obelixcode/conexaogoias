# Solução para Problema de Login - Conexão Goiás

## 🔍 Problema Identificado

O erro `Firebase: Error (auth/invalid-credential)` durante o login é causado por **credenciais inválidas do Firebase Admin SDK**.

### Erro Específico
```
invalid_grant: Invalid JWT Signature
```

## 🎯 Causa Raiz

As credenciais do Firebase Admin SDK no arquivo `.env.local` estão **inválidas ou expiradas**. Isso pode acontecer por:

1. **Chave privada corrompida** - Quebras de linha incorretas
2. **Service Account revogado** - Chave foi desabilitada no Firebase Console
3. **Credenciais antigas** - Service Account foi regenerado
4. **Formato incorreto** - Chave privada não está no formato correto

## ✅ Soluções

### Solução 1: Gerar Novas Credenciais (RECOMENDADA)

1. **Acesse o Firebase Console:**
   ```
   https://console.firebase.google.com/project/aconexaogoias/settings/serviceaccounts/adminsdk
   ```

2. **Gere uma nova chave:**
   - Clique em "Generate new private key"
   - Baixe o arquivo JSON
   - **NÃO** commite este arquivo no Git

3. **Atualize o `.env.local`:**
   ```bash
   # Copie os valores do arquivo JSON baixado
   FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aconexaogoias.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[SUA_NOVA_CHAVE_AQUI]\n-----END PRIVATE KEY-----\n"
   ```

### Solução 2: Verificar Credenciais Atuais

1. **Verifique se o Service Account existe:**
   ```
   https://console.firebase.google.com/iam-admin/serviceaccounts/project/aconexaogoias
   ```

2. **Se não existir, crie um novo:**
   - Vá em IAM & Admin > Service Accounts
   - Crie um novo service account com permissões de Firebase Admin

### Solução 3: Corrigir Formato da Chave Privada

Se a chave privada estiver corrompida, certifique-se de que:

1. **Quebras de linha corretas:**
   ```bash
   # Deve ter \n no lugar das quebras de linha reais
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
   ```

2. **Aspas duplas ao redor:**
   ```bash
   FIREBASE_ADMIN_PRIVATE_KEY="[CHAVE_COMPLETA_AQUI]"
   ```

## 🚀 Passos para Resolver

### 1. Gerar Novas Credenciais
```bash
# 1. Acesse o Firebase Console
# 2. Vá em Project Settings > Service Accounts
# 3. Clique em "Generate new private key"
# 4. Baixe o arquivo JSON
```

### 2. Atualizar .env.local
```bash
# Edite o arquivo .env.local com as novas credenciais
nano .env.local
```

### 3. Testar as Credenciais
```bash
# Execute o script de verificação
node scripts/verify-admin-user.js
```

### 4. Criar Usuário Admin (se necessário)
```bash
# Se não existir usuário admin, crie um no Firebase Console:
# 1. Authentication > Users > Add user
# 2. Email: admin@conexaogoias.com
# 3. Senha: [senha segura]
```

### 5. Testar Login
```bash
# Inicie a aplicação
npm run dev

# Acesse: http://localhost:3000/admin/login
# Teste o login com as credenciais criadas
```

## 🔧 Scripts de Diagnóstico

### Verificar Credenciais
```bash
./scripts/check-create-admin-user.sh
```

### Corrigir Permissões do Firestore
```bash
./scripts/fix-firestore-permissions.sh
```

### Diagnóstico Completo
```bash
./scripts/debug-login.sh
```

## 📋 Checklist de Verificação

- [ ] Service Account existe no Firebase Console
- [ ] Credenciais são válidas e atuais
- [ ] Formato da chave privada está correto
- [ ] Usuário admin existe no Firebase Auth
- [ ] Usuário admin existe no Firestore
- [ ] Regras do Firestore permitem leitura/escrita
- [ ] Aplicação está rodando corretamente

## 🚨 Problemas Comuns

### 1. "Invalid JWT Signature"
- **Causa:** Credenciais inválidas
- **Solução:** Gerar novas credenciais

### 2. "User not found"
- **Causa:** Usuário não existe no Firebase Auth
- **Solução:** Criar usuário no Firebase Console

### 3. "Permission denied"
- **Causa:** Regras do Firestore muito restritivas
- **Solução:** Executar `./scripts/fix-firestore-permissions.sh`

### 4. "Invalid email or password"
- **Causa:** Credenciais de login incorretas
- **Solução:** Verificar email e senha no Firebase Console

## 🎉 Resultado Esperado

Após seguir estas soluções:

1. ✅ Credenciais do Firebase Admin SDK válidas
2. ✅ Usuário admin criado e ativo
3. ✅ Regras do Firestore configuradas
4. ✅ Login funcionando corretamente
5. ✅ Aplicação rodando sem erros

## 📞 Próximos Passos

1. **Gere novas credenciais** no Firebase Console
2. **Atualize o .env.local** com as novas credenciais
3. **Crie um usuário admin** se não existir
4. **Teste o login** localmente
5. **Deploy para produção** quando funcionar localmente

---

**Nota:** Este problema é comum em projetos Firebase e geralmente é resolvido gerando novas credenciais do Service Account.
