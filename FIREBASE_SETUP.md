# 🔥 Guia Completo: Configuração Firebase + Deploy VPS

Este guia te ajudará a configurar corretamente o Firebase para funcionar tanto localmente quanto na VPS da Digital Ocean.

## 📋 Índice

1. [Configuração Firebase Console](#configuração-firebase-console)
2. [Obter Credenciais](#obter-credenciais)
3. [Configurar Variáveis de Ambiente](#configurar-variáveis-de-ambiente)
4. [Criar Usuário Administrador](#criar-usuário-administrador)
5. [Configurar Domínios Autorizados](#configurar-domínios-autorizados)
6. [Deploy na VPS](#deploy-na-vps)
7. [Validação e Debug](#validação-e-debug)
8. [Solução de Problemas](#solução-de-problemas)

## 🔧 Configuração Firebase Console

### 1. Acessar o Firebase Console

1. Vá para: https://console.firebase.google.com/
2. Selecione o projeto `aconexaogoias`
3. Se não existir, crie um novo projeto

### 2. Habilitar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em **Get Started**
3. Vá para a aba **Sign-in method**
4. Habilite **Email/Password**
5. Clique em **Save**

### 3. Configurar Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique em **Create database**
3. Escolha **Start in test mode** (para desenvolvimento)
4. Escolha a localização mais próxima (ex: us-central1)

## 🔑 Obter Credenciais

### Credenciais do Cliente (Public)

1. Vá para: **Project Settings** (ícone de engrenagem)
2. Na aba **General**, role até **Your apps**
3. Se não houver app web, clique em **Add app** > **Web**
4. Copie as credenciais do **Firebase SDK snippet**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "aconexaogoias.firebaseapp.com",
  projectId: "aconexaogoias",
  storageBucket: "aconexaogoias.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

### Credenciais do Admin (Private)

1. Vá para: **Project Settings** > **Service accounts**
2. Clique em **Generate new private key**
3. Baixe o arquivo JSON
4. Extraia as informações:

```bash
# Do arquivo JSON baixado:
project_id: "aconexaogoias"
private_key: "-----BEGIN PRIVATE KEY-----\n..."
client_email: "firebase-adminsdk-xxxxx@aconexaogoias.iam.gserviceaccount.com"
```

## 🌍 Configurar Variáveis de Ambiente

### Localmente

1. Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789

# Firebase Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyUl3I0mJQ7KPY\nPe4fT15J4IMUswthouvozQxxbxKAnQfPBA7OYmz+frinTE7pBQY2wwyBRJ389v0l\nc2b2u6WhSkhCe9+6CKDGfwFrznkM9tP7rHtVJfXODvhts1YgQiQeg0G+mlI5uylE\n0w2SVMoqENpMsRc2hn5jVg>\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aconexaogoias.iam.gserviceaccount.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Na VPS

1. Crie o arquivo `.env.production` na VPS:

```bash
# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789

# Firebase Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyUl3I0mJQ7KPY\nPe4fT15J4IMUswthouvozQxxbxKAnQfPBA7OYmz+frinTE7pBQY2wwyBRJ389v0l\nc2b2u6WhSkhCe9+6CKDGfwFrznkM9tP7rHtVJfXODvhts1YgQiQeg0G+mlI5uylE\n0w2SVMoqENpMsRc2hn5jVg>\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aconexaogoias.iam.gserviceaccount.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://conexaogoias.com
NODE_ENV=production
```

## 👤 Criar Usuário Administrador

### 1. Criar Usuário no Firebase Auth

1. Vá para: **Authentication** > **Users**
2. Clique em **Add user**
3. Digite email e senha
4. Clique em **Add user**
5. **Copie o UID do usuário** (será necessário)

### 2. Criar Documento no Firestore

1. Vá para: **Firestore Database** > **Data**
2. Clique em **Start collection**
3. Collection ID: `users`
4. Document ID: **[UID do usuário criado acima]**
5. Adicione os campos:

```json
{
  "name": "Administrador",
  "email": "admin@conexaogoias.com",
  "role": "admin",
  "isActive": true,
  "avatar": "",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "lastLoginAt": null
}
```

## 🌐 Configurar Domínios Autorizados

1. Vá para: **Authentication** > **Settings** > **Authorized domains**
2. Adicione os domínios:
   - `localhost` (para desenvolvimento)
   - `conexaogoias.com` (seu domínio de produção)
   - `www.conexaogoias.com` (se usar www)
   - IP da VPS (se usar IP direto)

## 🚀 Deploy na VPS

### 1. Preparar Arquivos

```bash
# Na VPS, criar arquivo .env.production
nano .env.production
# Cole o conteúdo das variáveis de ambiente

# Verificar se o arquivo foi criado
cat .env.production
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Build da Aplicação

```bash
npm run build
```

### 4. Iniciar Aplicação

```bash
# Com PM2
pm2 start npm --name "conexaogoias" -- start

# Ou diretamente
npm start
```

### 5. Verificar Logs

```bash
# Ver logs do PM2
pm2 logs conexaogoias

# Ver logs em tempo real
pm2 logs conexaogoias --follow
```

## ✅ Validação e Debug

### 1. Script de Validação

Execute o script de validação:

```bash
node scripts/validate-firebase-config.js
```

### 2. Verificar Logs

No console do navegador, procure por:

```
✅ Configurações do Firebase válidas
✅ Firebase configurado para produção
```

### 3. Testar Login

1. Acesse: `https://conexaogoias.com/admin/login`
2. Use as credenciais do usuário criado
3. Verifique se não há erros no console

## 🔧 Solução de Problemas

### Erro: `auth/invalid-credential`

**Possíveis causas:**
1. Usuário não existe no Firebase Auth
2. Senha incorreta
3. Domínio não autorizado
4. Configurações incorretas

**Soluções:**
1. Verificar se o usuário existe em Authentication > Users
2. Verificar se o domínio está em Authorized domains
3. Executar o script de validação
4. Verificar logs detalhados no console

### Erro: `auth/unauthorized-domain`

**Solução:**
1. Vá para Authentication > Settings > Authorized domains
2. Adicione seu domínio de produção

### Erro: `auth/network-request-failed`

**Possíveis causas:**
1. Firebase não acessível
2. Configurações incorretas
3. Problema de rede

**Soluções:**
1. Verificar conectividade com Firebase
2. Verificar configurações
3. Testar em ambiente local primeiro

### Erro: Configurações placeholder

**Solução:**
1. Substitua valores como `123456789` pelas credenciais reais
2. Use o script de validação para identificar placeholders

## 📞 Comandos Úteis

```bash
# Validar configuração
node scripts/validate-firebase-config.js

# Ver logs do PM2
pm2 logs conexaogoias

# Reiniciar aplicação
pm2 restart conexaogoias

# Ver status
pm2 status

# Parar aplicação
pm2 stop conexaogoias

# Remover do PM2
pm2 delete conexaogoias
```

## 🎯 Checklist Final

- [ ] Firebase Console configurado
- [ ] Authentication habilitado
- [ ] Firestore configurado
- [ ] Credenciais obtidas (client + admin)
- [ ] Variáveis de ambiente configuradas
- [ ] Usuário administrador criado
- [ ] Documento no Firestore criado
- [ ] Domínios autorizados
- [ ] Aplicação buildada
- [ ] Aplicação rodando na VPS
- [ ] Login funcionando
- [ ] Logs sem erros

## 🆘 Suporte

Se ainda tiver problemas:

1. Execute o script de validação
2. Verifique os logs detalhados
3. Confirme se todas as credenciais são REAIS (não placeholders)
4. Verifique se o usuário existe no Firebase Auth
5. Confirme se o domínio está autorizado

---

**Lembre-se:** Sempre use as credenciais REAIS do Firebase Console, nunca valores placeholder como `123456789` ou `abcdef123456`.
