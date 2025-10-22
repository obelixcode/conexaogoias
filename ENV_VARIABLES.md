# Variáveis de Ambiente - Firebase App Hosting

## Configuração Automática

No Firebase App Hosting, as variáveis de ambiente são configuradas automaticamente via `apphosting.yaml`:

```yaml
environmentVariables:
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    value: AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
    availability: RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    value: aconexaogoias.firebaseapp.com
    availability: RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
    value: aconexaogoias
    availability: RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    value: aconexaogoias.firebasestorage.app
    availability: RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    value: "6509088743"
    availability: RUNTIME
  - variable: NEXT_PUBLIC_FIREBASE_APP_ID
    value: 1:6509088743:web:f1866c676e18c53204f742
    availability: RUNTIME
  - variable: NEXT_PUBLIC_APP_URL
    availability: RUNTIME
    secret: appurl
```

## Secrets

Para configurar o secret `appurl`:

```bash
firebase apphosting:secrets:set appurl
```

Digite a URL de produção (ex: `https://aconexaogoias.web.app`)

## Desenvolvimento Local

Para desenvolvimento local, crie um arquivo `.env.local`:

```bash
# Firebase Configuration (Public - Runtime)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Admin (Local Development Only - Use ADC in production)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@aconexaogoias.iam.gserviceaccount.com
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
```

## Application Default Credentials (ADC)

No Firebase App Hosting, o Firebase Admin SDK usa automaticamente Application Default Credentials (ADC). Não é necessário configurar credenciais manualmente em produção.

## Verificação

Para verificar se as variáveis estão configuradas corretamente:

```bash
# Verificar secrets
firebase apphosting:secrets:list

# Verificar logs
firebase apphosting:logs
```

## Troubleshooting

### Problemas Comuns

1. **Variáveis não encontradas**
   - Verifique se o `apphosting.yaml` está correto
   - Execute `firebase deploy --only apphosting`

2. **Secret não configurado**
   ```bash
   firebase apphosting:secrets:set appurl
   ```

3. **Problemas de ADC**
   - ADC é automático no App Hosting
   - Para desenvolvimento local, configure as variáveis `FIREBASE_ADMIN_*`
