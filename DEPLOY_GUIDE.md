# Guia de Deploy - Conexão Goiás

## Configuração do Vercel

### 1. Conectar o Repositório GitHub

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Importe o repositório `conexaogoias`
5. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (padrão do Next.js)

### 2. Configurar Variáveis de Ambiente

Configure as seguintes variáveis no dashboard do Vercel:

#### Variáveis Públicas (NEXT_PUBLIC_*)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_APP_URL
```

#### Variáveis Privadas
```
FIREBASE_ADMIN_PRIVATE_KEY
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PROJECT_ID
```

### 3. Configurações do Domínio

1. No dashboard do Vercel, vá para "Settings" > "Domains"
2. Adicione seu domínio personalizado (ex: `conexaogoias.com`)
3. Configure os registros DNS conforme instruções do Vercel

### 4. Deploy Automático

O deploy será automático sempre que houver push para a branch `main`:
- ✅ Build automático
- ✅ Deploy automático
- ✅ Preview de branches
- ✅ Rollback fácil

## Estrutura do Projeto

```
conexaogoias/
├── src/
│   ├── app/                 # App Router do Next.js
│   │   ├── (public)/       # Rotas públicas
│   │   ├── admin/          # Painel administrativo
│   │   └── api/            # API Routes
│   ├── components/         # Componentes React
│   ├── lib/               # Serviços e utilitários
│   ├── types/             # Definições TypeScript
│   └── utils/             # Funções utilitárias
├── public/                # Arquivos estáticos
├── vercel.json           # Configuração do Vercel
└── next.config.ts        # Configuração do Next.js
```

## Funcionalidades Implementadas

### ✅ Públicas
- Homepage com notícias em destaque
- Listagem de notícias por categoria
- Página individual de notícias
- Sistema de busca
- Páginas institucionais (sobre, contato, etc.)
- RSS Feed
- Sitemap XML

### ✅ Administrativas
- Dashboard completo
- Gerenciamento de notícias
- Gerenciamento de categorias
- Gerenciamento de usuários
- Sistema de banners
- Editor de páginas
- Roadmap de funcionalidades
- Configurações do site

### ✅ Técnicas
- Autenticação Firebase
- Banco de dados Firestore
- Storage para imagens
- SEO otimizado
- Responsivo
- TypeScript
- Tailwind CSS

## Monitoramento

- **Vercel Analytics**: Métricas de performance
- **Vercel Speed Insights**: Core Web Vitals
- **Firebase Console**: Dados e autenticação
- **GitHub Actions**: CI/CD (se configurado)

## Troubleshooting

### Build Falhando
1. Verifique as variáveis de ambiente
2. Execute `npm run build` localmente
3. Verifique os logs no Vercel

### Erro de Firebase
1. Confirme as credenciais do Firebase
2. Verifique as regras do Firestore
3. Confirme as permissões do Storage

### Performance
1. Use o Vercel Analytics
2. Otimize imagens
3. Implemente cache quando necessário
