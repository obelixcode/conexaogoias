# 🔧 Fix para EasyPanel - Erro ENOENT uv_cwd

## 🚨 Problema Identificado
O erro `ENOENT: no such file or directory, uv_cwd` ocorre quando o diretório de trabalho atual é removido ou não existe durante o processo de build.

## ✅ Soluções Implementadas

### 1. **Script de Deploy Otimizado** (`deploy.sh`)
- Verifica se o diretório existe antes de executar comandos
- Limpa cache e dependências antigas
- Instala dependências com flags específicas
- Faz build com verificações de erro

### 2. **Configurações EasyPanel** (`.easypanelrc`)
- Define comandos de build e start
- Configura diretório de trabalho
- Define variáveis de ambiente

### 3. **Dockerfile Otimizado**
- Usa Node.js 18 Alpine
- Instala dependências do sistema
- Define diretório de trabalho explícito
- Build otimizado para produção

### 4. **Package.json Atualizado**
- Scripts `postinstall` e `prestart` para garantir build
- Dependências otimizadas

## 🚀 Configuração no EasyPanel

### **Opção 1: Usar Script de Deploy**
```bash
# Build Command
chmod +x deploy.sh && ./deploy.sh

# Start Command
npm start

# Port
3000
```

### **Opção 2: Usar Dockerfile**
```bash
# Build Command
docker build -t conexaogoias .

# Start Command
docker run -p 3000:3000 conexaogoias
```

### **Opção 3: Comandos Manuais**
```bash
# Build Command
npm install --legacy-peer-deps && npm run build

# Start Command
npm start

# Port
3000
```

## 🔧 Variáveis de Ambiente Necessárias

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aconexaogoias.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[SUA_CHAVE_AQUI]\n-----END PRIVATE KEY-----\n"
```

## 📋 Passos para Resolver

### **1. Limpar Aplicação no EasyPanel**
- Pare a aplicação atual
- Remova todos os arquivos
- Reinicie o container

### **2. Reconfigurar Aplicação**
- **Tipo**: Node.js
- **Build Command**: `chmod +x deploy.sh && ./deploy.sh`
- **Start Command**: `npm start`
- **Port**: 3000
- **Node Version**: 18

### **3. Adicionar Variáveis de Ambiente**
- Copie todas as variáveis acima
- Adicione no painel do EasyPanel

### **4. Fazer Deploy**
- Clique em "Deploy"
- Aguarde o build completar
- Verifique os logs

## 🔍 Troubleshooting

### **Se o erro persistir:**

1. **Verificar Logs**
   ```bash
   # No EasyPanel, vá em Logs
   # Procure por erros específicos
   ```

2. **Testar Localmente**
   ```bash
   # Clone o repositório
   git clone https://github.com/obelixcode/conexaogoias.git
   cd conexaogoias
   
   # Instalar dependências
   npm install --legacy-peer-deps
   
   # Fazer build
   npm run build
   
   # Testar start
   npm start
   ```

3. **Verificar Permissões**
   ```bash
   # No EasyPanel, verifique se o usuário tem permissões
   # para criar/ler/escrever no diretório
   ```

## ✅ Verificação de Sucesso

Após o deploy, verifique:
- ✅ Aplicação acessível na URL
- ✅ Logs sem erros
- ✅ Build concluído com sucesso
- ✅ Variáveis de ambiente carregadas

## 🆘 Suporte

Se o problema persistir:
1. Verifique os logs completos no EasyPanel
2. Teste localmente primeiro
3. Verifique se todas as variáveis de ambiente estão corretas
4. Confirme que o repositório GitHub está atualizado
