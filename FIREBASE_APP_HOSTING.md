# Firebase App Hosting - Guia de Deploy

Este guia explica como fazer deploy da aplicação Conexão Goiás no Firebase App Hosting.

## Pré-requisitos

1. **Firebase CLI instalado e configurado**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Projeto Firebase configurado**
   - Projeto: `aconexaogoias`
   - Firestore habilitado
   - Storage habilitado
   - Authentication habilitado

## Configuração Inicial

### 1. Inicializar App Hosting

```bash
firebase init apphosting
```

Selecione:
- Projeto: `aconexaogoias`
- Backend: Next.js
- Framework: Next.js

### 2. Configurar Secrets

Configure o secret para a URL da aplicação:

```bash
firebase apphosting:secrets:set appurl
```

Digite a URL de produção (ex: `https://aconexaogoias.web.app`)

### 3. Verificar Configuração

Verifique se os arquivos estão corretos:
- `apphosting.yaml` - Configuração do App Hosting
- `.firebaserc` - Projeto Firebase
- `firebase.json` - Configuração do Firebase

## Deploy

### Deploy Manual

```bash
# Build da aplicação
npm run build

# Deploy para App Hosting
npm run deploy:hosting
# ou
firebase deploy --only apphosting
```

### Deploy Automático (CI/CD)

O Firebase App Hosting suporta deploy automático via GitHub:

1. Conecte o repositório no Firebase Console
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push na branch principal

## Configuração de Domínio Personalizado

### 1. Via Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto `aconexaogoias`
3. Vá para "App Hosting"
4. Clique em "Add custom domain"
5. Digite o domínio (ex: `conexaogoias.com`)
6. Configure os registros DNS conforme instruído

### 2. Via CLI

```bash
firebase apphosting:domains:add conexaogoias.com
```

## Monitoramento e Logs

### Visualizar Logs

```bash
# Logs em tempo real
firebase apphosting:logs

# Logs de uma instância específica
firebase apphosting:logs --instance-id INSTANCE_ID
```

### Monitoramento no Console

1. Acesse Firebase Console > App Hosting
2. Visualize métricas de performance
3. Configure alertas
4. Monitore erros e exceções

## Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente no `apphosting.yaml`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_APP_URL` (via secret)

## Troubleshooting

### Problemas Comuns

1. **Erro de Build**
   ```bash
   # Verificar logs de build
   firebase apphosting:logs --type=build
   ```

2. **Erro de Runtime**
   ```bash
   # Verificar logs de runtime
   firebase apphosting:logs --type=runtime
   ```

3. **Problemas de Autenticação**
   - Verificar se o Firebase Admin SDK está configurado corretamente
   - ADC (Application Default Credentials) é usado automaticamente

4. **Problemas de Performance**
   - Verificar configurações de `apphosting.yaml`
   - Ajustar `minInstances`, `maxInstances`, `cpu`, `memoryMiB`

### Comandos Úteis

```bash
# Status do App Hosting
firebase apphosting:instances:list

# Informações detalhadas
firebase apphosting:instances:get INSTANCE_ID

# Reiniciar instância
firebase apphosting:instances:restart INSTANCE_ID
```

## Configurações Avançadas

### Ajustar Recursos

Edite `apphosting.yaml`:

```yaml
runConfig:
  minInstances: 1      # Mínimo de instâncias
  maxInstances: 20     # Máximo de instâncias
  concurrency: 100     # Requisições simultâneas por instância
  cpu: 2               # CPUs
  memoryMiB: 1024    # Memória em MB
```

### Configurar Health Checks

```yaml
runConfig:
  healthCheck:
    path: "/api/health"
    timeoutSeconds: 30
```

## Segurança

### Headers de Segurança

Configurados automaticamente no `next.config.ts`:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

### Autenticação

- Session cookies para admin
- Firebase Auth para usuários
- Middleware de proteção de rotas

## Performance

### Otimizações Implementadas

1. **ISR (Incremental Static Regeneration)**
   - Páginas estáticas com revalidação
   - Cache inteligente

2. **Otimização de Imagens**
   - Next.js Image Optimization
   - Firebase Storage integration

3. **Bundle Optimization**
   - Tree shaking
   - Code splitting
   - Lazy loading

### Monitoramento

- Firebase Performance Monitoring
- Real User Monitoring (RUM)
- Core Web Vitals

## Backup e Recuperação

### Backup de Dados

```bash
# Backup do Firestore
firebase firestore:export gs://aconexaogoias-backup/backup-$(date +%Y%m%d)

# Backup do Storage
gsutil -m cp -r gs://aconexaogoias.firebasestorage.app gs://aconexaogoias-backup/storage-$(date +%Y%m%d)
```

### Recuperação

```bash
# Restaurar Firestore
firebase firestore:import gs://aconexaogoias-backup/backup-YYYYMMDD

# Restaurar Storage
gsutil -m cp -r gs://aconexaogoias-backup/storage-YYYYMMDD gs://aconexaogoias.firebasestorage.app
```

## Suporte

Para problemas específicos do Firebase App Hosting:

1. [Documentação Oficial](https://firebase.google.com/docs/app-hosting)
2. [Firebase Support](https://firebase.google.com/support)
3. [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-app-hosting)
