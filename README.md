# Portal de Notícias "Conexão Goiás" 🚀

Portal de notícias moderno e completo com painel administrativo idêntico ao WordPress, desenvolvido com Next.js 14, TypeScript, Firebase e TailwindCSS.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Editor**: Tiptap (editor de texto rico)
- **Deploy**: VPS (Digital Ocean) + Firebase (Backend)

## 📋 Funcionalidades

### Portal Público

- ✅ Homepage com notícias em destaque e seções por categoria
- ✅ Páginas de notícias individuais com SEO otimizado
- ✅ Páginas de categoria com paginação
- ✅ Sistema de compartilhamento social
- ✅ Notícias relacionadas inteligentes
- ✅ Contador de visualizações
- ✅ RSS Feed dinâmico
- ✅ Sitemap automático

### Painel Administrativo

- ✅ Dashboard com estatísticas
- ✅ Editor de notícias com Tiptap
- ✅ Gestão de categorias
- ✅ Sistema de banners publicitários
- ✅ Controle de destaques na homepage
- ✅ Autenticação e autorização

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd conexaogoias
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Conexão Goiás"
```

### 4. Configure o Firebase

#### 4.1 Firestore Database

Crie as seguintes coleções no Firestore:

**Coleção: `categories`**

```javascript
// Documento de exemplo
{
  name: "Política",
  slug: "politica",
  color: "#ef4444",
  description: "Notícias sobre política",
  order: 1,
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Coleção: `news`**

```javascript
// Documento de exemplo
{
  title: "Título da notícia",
  subtitle: "Subtítulo da notícia",
  content: "<p>Conteúdo HTML da notícia</p>",
  coverImage: "https://firebasestorage...",
  categoryId: "category_id",
  author: "Nome do autor",
  tags: ["tag1", "tag2"],
  slug: "titulo-da-noticia",
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp,
  isPublished: true,
  isFeatured: false,
  featuredPosition: null,
  views: 0,
  metaDescription: "Meta description",
  metaKeywords: ["keyword1", "keyword2"]
}
```

**Coleção: `users`**

```javascript
// Documento de exemplo
{
  uid: "user_uid",
  name: "Nome do Admin",
  email: "admin@conexaogoias.com",
  role: "admin", // ou "editor"
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp,
  isActive: true
}
```

**Coleção: `banners`**

```javascript
// Documento de exemplo
{
  title: "Título do banner",
  image: "https://firebasestorage...",
  link: "https://exemplo.com",
  position: "sidebar-top", // sidebar-top, sidebar-bottom, header, content-top, content-bottom, between-news
  isActive: true,
  order: 1,
  clicks: 0,
  impressions: 0,
  createdAt: timestamp,
  updatedAt: timestamp,
  expiresAt: timestamp, // opcional
  targetAudience: "geral" // opcional
}
```

#### 4.2 Regras de Segurança do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Categorias - leitura pública, escrita apenas para admins
    match /categories/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Notícias - leitura pública, escrita para admins e editores
    match /news/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'editor'];
    }
    
    // Usuários - apenas admins podem ler/escrever
    match /users/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Banners - leitura pública, escrita apenas para admins
    match /banners/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Cliques de banner - escrita pública, leitura apenas para admins
    match /bannerClicks/{document} {
      allow create: if true;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### 4.3 Regras de Segurança do Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Imagens de capa
    match /covers/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Imagens de conteúdo
    match /content/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Banners
    match /banners/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Crie o primeiro usuário administrador

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Vá para Authentication > Users
3. Clique em "Add user" e crie um usuário com email e senha
4. Vá para Firestore Database
5. Crie um documento na coleção `users` com o UID do usuário criado:

```javascript
{
  uid: "UID_DO_USUARIO",
  name: "Administrador",
  email: "admin@conexaogoias.com",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
}
```

### 6. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o portal público e [http://localhost:3000/admin](http://localhost:3000/admin) para o painel administrativo.

## 📁 Estrutura do Projeto

```text
src/
├── app/
│   ├── (public)/          # Rotas públicas
│   │   ├── page.tsx       # Homepage
│   │   ├── noticia/[slug]/ # Página de notícia
│   │   └── categoria/[slug]/ # Página de categoria
│   ├── admin/             # Painel administrativo
│   │   ├── login/         # Login
│   │   ├── dashboard/     # Dashboard
│   │   ├── editor/        # Editor de notícias
│   │   ├── categorias/    # Gestão de categorias
│   │   └── banners/       # Gestão de banners
│   └── api/               # API routes
├── components/            # Componentes reutilizáveis
├── lib/                   # Serviços Firebase
├── types/                 # TypeScript types
└── utils/                 # Utilitários
```

## 🚀 Deploy

### Frontend (Vercel)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Firebase Hosting (Opcional)

```bash
npm run build
firebase deploy --only hosting
```

## 📝 Uso

### Portal Público - Navegação

- Navegue pelas categorias no menu
- Leia notícias completas
- Compartilhe nas redes sociais
- Acesse o RSS feed em `/api/rss`

### Painel Administrativo - Operações

1. Faça login em `/admin/login`
2. Acesse o dashboard para ver estatísticas
3. Crie/edite notícias no editor
4. Gerencie categorias e banners
5. Configure destaques na homepage

## 🔧 Desenvolvimento

### Scripts disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
```

### Adicionando novas funcionalidades

1. Crie os tipos em `src/types/`
2. Implemente os serviços em `src/lib/`
3. Crie os componentes em `src/components/`
4. Adicione as páginas em `src/app/`

## 📞 Suporte

Para dúvidas ou problemas, entre em contato através do email: [contato@conexaogoias.com](mailto:contato@conexaogoias.com)

## 📄 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.
