# Variáveis de Ambiente para Firebase App Hosting

Este documento lista todas as variáveis de ambiente necessárias para o deploy no Firebase App Hosting.

## Variáveis Obrigatórias

### Firebase Client (NEXT_PUBLIC_*)

Estas variáveis são expostas ao cliente e são obrigatórias:

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Chave da API do Firebase
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Domínio de autenticação (ex: `aconexaogoias.firebaseapp.com`)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - ID do projeto Firebase (ex: `aconexaogoias`)
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Bucket de storage (ex: `aconexaogoias.firebasestorage.app`)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - ID do remetente de mensagens
- `NEXT_PUBLIC_FIREBASE_APP_ID` - ID da aplicação web

### Firebase Admin (FIREBASE_ADMIN_*)

Estas variáveis são privadas e usadas apenas no servidor:

- `FIREBASE_ADMIN_PROJECT_ID` - ID do projeto Firebase (pode usar `NEXT_PUBLIC_FIREBASE_PROJECT_ID` como fallback)
- `FIREBASE_ADMIN_CLIENT_EMAIL` - Email da conta de serviço (ex: `firebase-adminsdk-xxxxx@aconexaogoias.iam.gserviceaccount.com`)
- `FIREBASE_ADMIN_PRIVATE_KEY` - Chave privada da conta de serviço (com `\n` para quebras de linha)

**Importante**: A `FIREBASE_ADMIN_PRIVATE_KEY` deve incluir as quebras de linha `\n` e pode estar entre aspas. O código automaticamente remove as aspas e converte `\n` em quebras de linha reais.

## Variáveis Opcionais

### Configuração da Aplicação

- `NEXT_PUBLIC_APP_URL` - URL base da aplicação (ex: `https://conexaogoias.com`)
  - Usado em: sitemap, RSS feed, metadados SEO
  - Fallback: `http://localhost:3000`

- `NEXT_PUBLIC_SITE_URL` - URL do site (alternativa ao `NEXT_PUBLIC_APP_URL`)
  - Usado em: serviços de SEO
  - Fallback: `https://conexaogoias.com`

- `NODE_ENV` - Ambiente de execução (`development` ou `production`)
  - Definido automaticamente pelo Firebase App Hosting em produção
  - Não precisa ser configurado manualmente

### Firebase Emulators (Desenvolvimento Local)

- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` - Usar emuladores do Firebase (`true` ou `false`)
  - Apenas para desenvolvimento local
  - Não necessário no App Hosting

## Como Configurar no Firebase Console

### 1. Acessar Firebase Console

1. Vá para: https://console.firebase.google.com/
2. Selecione o projeto `aconexaogoias`
3. Vá para **App Hosting** no menu lateral

### 2. Configurar Variáveis de Ambiente

1. No App Hosting, vá para **Environment variables**
2. Adicione cada variável obrigatória:
   - Clique em **Add variable**
   - Digite o nome da variável
   - Digite o valor
   - Clique em **Save**

### 3. Obter Valores das Variáveis

#### Firebase Client (NEXT_PUBLIC_*)

1. Vá para **Project Settings** (ícone de engrenagem)
2. Na aba **General**, role até **Your apps**
3. Selecione o app web
4. Copie os valores do **Firebase SDK snippet**

#### Firebase Admin (FIREBASE_ADMIN_*)

1. Vá para **Project Settings** > **Service accounts**
2. Clique em **Generate new private key**
3. Baixe o arquivo JSON
4. Extraia os valores:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (copie com `\n` incluídos)
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`

**Importante**: Ao copiar a `private_key` do JSON, mantenha as quebras de linha `\n` ou copie exatamente como está no arquivo JSON (com `\n` como texto).

## Checklist de Configuração

Antes do deploy, verifique se todas estas variáveis estão configuradas:

### Firebase Client
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin
- [ ] `FIREBASE_ADMIN_PROJECT_ID` (ou usar `NEXT_PUBLIC_FIREBASE_PROJECT_ID`)
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY`

### Opcionais (Recomendado)
- [ ] `NEXT_PUBLIC_APP_URL` (URL de produção)
- [ ] `NEXT_PUBLIC_SITE_URL` (URL do site)

## Validação

Execute o script de validação antes do deploy:

```bash
npm run validate:env
```

Este script verifica se todas as variáveis obrigatórias estão presentes e se os valores são válidos.

## Troubleshooting

### Erro: "Firebase Admin SDK não inicializado"

**Causa**: Variáveis `FIREBASE_ADMIN_*` não configuradas ou inválidas.

**Solução**:
1. Verifique se todas as variáveis `FIREBASE_ADMIN_*` estão configuradas no Firebase Console
2. Verifique se a `FIREBASE_ADMIN_PRIVATE_KEY` está completa (incluindo `BEGIN PRIVATE KEY` e `END PRIVATE KEY`)
3. Execute o script de validação

### Erro: "Configurações demo não permitidas em produção"

**Causa**: Variáveis `NEXT_PUBLIC_FIREBASE_*` não configuradas ou usando valores placeholder.

**Solução**:
1. Verifique se todas as variáveis `NEXT_PUBLIC_FIREBASE_*` estão configuradas
2. Certifique-se de usar valores reais do Firebase Console, não placeholders
3. Execute o script de validação

### Erro: "Token inválido" ou "Credenciais inválidas"

**Causa**: `FIREBASE_ADMIN_PRIVATE_KEY` mal formatada.

**Solução**:
1. Certifique-se de que a chave privada inclui todas as quebras de linha
2. Se copiou do JSON, mantenha os `\n` como texto literal
3. O código automaticamente converte `\n` em quebras de linha reais

