# Deploy no Firebase App Hosting

Este guia explica como fazer o deploy do projeto Next.js no Firebase App Hosting.

## Pré-requisitos

1. Conta no Firebase com projeto `aconexaogoias` criado
2. Firebase CLI instalado (`npm install -g firebase-tools`)
3. Autenticado no Firebase CLI (`firebase login`)
4. Todas as variáveis de ambiente configuradas (ver `FIREBASE_APP_HOSTING_ENV.md`)

## Configuração Inicial

### 1. Verificar Configuração do Projeto

Certifique-se de que os arquivos de configuração estão corretos:

- `.firebaserc` - Deve conter o projeto `aconexaogoias`
- `firebase.json` - Deve ter a seção `hosting` configurada
- Variáveis de ambiente configuradas no Firebase Console

### 2. Configurar Variáveis de Ambiente no Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto `aconexaogoias`
3. Vá para **App Hosting** no menu lateral
4. Clique em **Environment variables**
5. Adicione todas as variáveis obrigatórias (ver `FIREBASE_APP_HOSTING_ENV.md`)

**Variáveis obrigatórias:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

**Variáveis opcionais (recomendadas):**
- `NEXT_PUBLIC_APP_URL` - URL de produção (ex: `https://conexaogoias.com`)
- `NEXT_PUBLIC_SITE_URL` - URL do site

## Processo de Deploy

### Opção 1: Deploy via Firebase Console (Recomendado)

1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto `aconexaogoias`
3. Vá para **App Hosting**
4. Clique em **Create app**
5. Conecte seu repositório Git (GitHub, GitLab, etc)
6. Configure o build:
   - **Build command**: `npm run build`
   - **Output directory**: `.next`
   - **Node version**: `20` (ou a versão que você está usando)
7. Configure as variáveis de ambiente (se ainda não configurou)
8. Clique em **Deploy**

O Firebase App Hosting fará o build e deploy automaticamente sempre que você fizer push para o branch configurado.

### Opção 2: Deploy via Firebase CLI

#### 2.1 Validar Configuração

Antes do deploy, valide as variáveis de ambiente:

```bash
npm run validate:env
```

Este script verifica se todas as variáveis obrigatórias estão configuradas.

#### 2.2 Build Local (Opcional)

Para testar o build localmente antes do deploy:

```bash
npm run build
```

#### 2.3 Deploy

**Deploy apenas do hosting:**
```bash
npm run deploy:hosting
```

**Deploy de tudo (hosting + firestore + storage):**
```bash
npm run deploy:all
```

**Deploy apenas do Firestore:**
```bash
npm run deploy:firestore
```

**Deploy apenas do Storage:**
```bash
npm run deploy:storage
```

## Verificação Pós-Deploy

### 1. Verificar Status do Deploy

1. Acesse o Firebase Console
2. Vá para **App Hosting**
3. Verifique o status do último deploy
4. Se houver erros, verifique os logs

### 2. Testar a Aplicação

1. Acesse a URL fornecida pelo Firebase App Hosting
2. Teste as funcionalidades principais:
   - Homepage carrega corretamente
   - Páginas de notícias funcionam
   - Login no painel admin funciona
   - API routes funcionam (`/api/rss`)
   - Middleware funciona (redirecionamentos)

### 3. Verificar Logs

No Firebase Console, vá para **App Hosting** > **Logs** para ver os logs da aplicação em tempo real.

## Configuração de Domínio Customizado

### 1. Adicionar Domínio

1. No Firebase Console, vá para **App Hosting**
2. Clique em **Add custom domain**
3. Digite seu domínio (ex: `conexaogoias.com`)
4. Siga as instruções para configurar o DNS

### 2. Configurar DNS

O Firebase fornecerá registros DNS que você precisa adicionar no seu provedor de DNS (Cloudflare, etc):

- **Tipo A**: Aponta para o IP do Firebase
- **Tipo CNAME**: Aponta para o domínio do Firebase

### 3. Verificar SSL

O Firebase automaticamente configura SSL/TLS para seu domínio customizado. Aguarde alguns minutos para a verificação.

## Troubleshooting

### Erro: "Build failed"

**Possíveis causas:**
1. Variáveis de ambiente não configuradas
2. Erros de TypeScript
3. Dependências faltando

**Soluções:**
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Execute `npm run type-check` localmente
3. Execute `npm install` e verifique se todas as dependências estão instaladas

### Erro: "Firebase Admin SDK não inicializado"

**Causa**: Variáveis `FIREBASE_ADMIN_*` não configuradas ou inválidas.

**Solução:**
1. Verifique se todas as variáveis `FIREBASE_ADMIN_*` estão configuradas no Firebase Console
2. Verifique se a `FIREBASE_ADMIN_PRIVATE_KEY` está completa
3. Execute `npm run validate:env` para validar

### Erro: "Configurações demo não permitidas em produção"

**Causa**: Variáveis `NEXT_PUBLIC_FIREBASE_*` não configuradas ou usando valores placeholder.

**Solução:**
1. Verifique se todas as variáveis `NEXT_PUBLIC_FIREBASE_*` estão configuradas
2. Certifique-se de usar valores reais do Firebase Console, não placeholders
3. Execute `npm run validate:env` para validar

### Erro: "API route não encontrada"

**Causa**: Rotas de API não estão sendo servidas corretamente.

**Solução:**
1. Verifique se o `next.config.ts` está correto
2. Verifique se as rotas de API estão em `src/app/api/`
3. Verifique os logs do Firebase App Hosting

### Erro: "Middleware não funciona"

**Causa**: Middleware não está sendo executado.

**Solução:**
1. Verifique se o `middleware.ts` está em `src/middleware.ts`
2. Verifique se o `matcher` está configurado corretamente
3. Verifique os logs do Firebase App Hosting

## Checklist de Deploy

Antes de fazer o deploy, verifique:

- [ ] Todas as variáveis de ambiente estão configuradas no Firebase Console
- [ ] `.firebaserc` está configurado corretamente
- [ ] `firebase.json` tem a seção `hosting` configurada
- [ ] Build local funciona (`npm run build`)
- [ ] Validação de variáveis passa (`npm run validate:env`)
- [ ] Testes locais passam
- [ ] Código está commitado e pushado para o repositório

## Comandos Úteis

```bash
# Validar variáveis de ambiente
npm run validate:env

# Build local
npm run build

# Deploy apenas do hosting
npm run deploy:hosting

# Deploy de tudo
npm run deploy:all

# Ver logs do Firebase
firebase functions:log

# Verificar status do projeto
firebase projects:list
```

## Próximos Passos

Após o deploy bem-sucedido:

1. Configure domínio customizado (se necessário)
2. Configure SSL/TLS (automático no Firebase)
3. Configure monitoramento e alertas
4. Configure backup automático do Firestore
5. Configure regras de segurança do Firestore e Storage

## Suporte

Se ainda tiver problemas:

1. Verifique os logs no Firebase Console
2. Execute `npm run validate:env` para validar variáveis
3. Verifique a documentação do Firebase App Hosting
4. Verifique se todas as dependências estão instaladas

---

**Lembre-se**: Sempre valide as variáveis de ambiente antes do deploy usando `npm run validate:env`.

