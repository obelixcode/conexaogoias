# Guia de Deploy para Netlify

## Configuração do Projeto

O projeto foi configurado para static export com as seguintes modificações:

### 1. Configuração do Next.js (`next.config.ts`)
- `output: 'export'` - Habilita static export
- `trailingSlash: true` - Adiciona barra final nas URLs
- `images: { unoptimized: true }` - Desabilita otimização de imagens para static export

### 2. Arquivos de Configuração Criados

#### `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/admin/*"
  to = "/404.html"
  status = 404

[[redirects]]
  from = "/api/*"
  to = "/404.html"
  status = 404

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "functions"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### `public/_redirects`
```
# Redirect admin pages to a 404 or login page for static export
/admin/* /404.html 404

# API routes (if any remain)
/api/* /404.html 404

# Fallback for all other routes
/* /index.html 200
```

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no dashboard do Netlify:

### Públicas (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_APP_URL` (URL do site no Netlify)

### Privadas (usar valores do firebase-admin-key.json)
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PROJECT_ID`

## Passos para Deploy

### 1. Conectar Repositório
1. Acesse o dashboard do Netlify
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente listadas acima

### 2. Configurações de Build
- **Build command**: `npm run build`
- **Publish directory**: `out`
- **Node version**: 18

### 3. Deploy das Regras do Firebase

Após o deploy do site, execute os seguintes comandos para atualizar as regras de segurança:

```bash
# Deploy das regras do Firestore
firebase deploy --only firestore:rules

# Deploy dos indexes do Firestore
firebase deploy --only firestore:indexes

# Deploy das regras do Storage
firebase deploy --only storage
```

## Limitações do Static Export

### Páginas do Admin
- As páginas do admin foram movidas para `admin-pages/` temporariamente
- Elas não funcionarão no static export
- Para usar o admin, será necessário um deploy separado com Next.js normal

### API Routes
- Apenas a rota `/api/rss` foi mantida (configurada como static)
- Outras API routes foram removidas ou redirecionadas para 404

### Funcionalidades Dinâmicas
- Contadores de visualização não funcionarão (requerem server-side)
- Comentários e interações em tempo real não funcionarão
- Upload de arquivos não funcionará

## Estrutura de Arquivos Gerada

Após o build, a pasta `out/` conterá:
- Páginas estáticas HTML
- Assets otimizados (CSS, JS, imagens)
- Arquivos de redirecionamento
- Sitemap.xml
- RSS feed

## Monitoramento

Após o deploy, monitore:
1. **Performance**: Verifique o Core Web Vitals
2. **SEO**: Teste o sitemap e meta tags
3. **Funcionalidades**: Teste navegação e carregamento de conteúdo
4. **Firebase**: Verifique se as regras de segurança estão ativas

## Troubleshooting

### Erro de Build
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se as credenciais do Firebase estão corretas
- Verifique os logs de build no Netlify

### Erro de Permissão no Firebase
- Execute `firebase deploy --only firestore:rules` para atualizar as regras
- Verifique se o usuário tem permissões de admin no projeto Firebase

### Páginas não Carregando
- Verifique se as regras de redirecionamento estão corretas
- Confirme se o `_redirects` está na pasta `public/`
