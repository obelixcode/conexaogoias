# 🚀 Instruções de Deploy - DigitalOcean Ubuntu

## 📋 RESUMO RÁPIDO

Para implementar o sistema 100% em um servidor Ubuntu da DigitalOcean, siga estes passos:

## 🔧 PASSO 1: CONFIGURAR SERVIDOR

### **1.1 Conectar ao Servidor**
```bash
ssh root@SEU_IP_DO_SERVIDOR
```

### **1.2 Executar Script de Configuração**
```bash
# Baixar e executar script de configuração
curl -fsSL https://raw.githubusercontent.com/obelixcode/conexaogoias/main/scripts/setup-server.sh | bash
```

**OU manualmente:**
```bash
# Clonar repositório
git clone https://github.com/obelixcode/conexaogoias.git /var/www/conexaogoias
cd /var/www/conexaogoias

# Executar script
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

## 🔧 PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE

### **2.1 Editar Arquivo de Ambiente**
```bash
nano /var/www/conexaogoias/.env.production
```

### **2.2 Configurar Variáveis**
```env
# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742

# App Configuration
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NEXT_PUBLIC_APP_NAME="Conexão Goiás"

# Firebase Admin (Production)
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aconexaogoias.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[SUA_CHAVE_PRIVADA_AQUI]\n-----END PRIVATE KEY-----\n"

# Node Environment
NODE_ENV=production
PORT=3000
```

## 🔧 PASSO 3: CONFIGURAR DOMÍNIO E SSL

### **3.1 Configurar DNS**
- Aponte seu domínio para o IP do servidor
- Configure registro A: `@` → `SEU_IP`
- Configure registro CNAME: `www` → `seu-dominio.com`

### **3.2 Configurar SSL**
```bash
cd /var/www/conexaogoias
./scripts/setup-ssl.sh seu-dominio.com
```

## 🔧 PASSO 4: VERIFICAR FUNCIONAMENTO

### **4.1 Monitorar Sistema**
```bash
cd /var/www/conexaogoias
./scripts/monitor.sh
```

### **4.2 Testar Aplicação**
- Acesse: `http://SEU_IP` (sem SSL)
- Acesse: `https://seu-dominio.com` (com SSL)

## 🔧 COMANDOS ÚTEIS

### **Gerenciamento da Aplicação**
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs conexaogoias

# Reiniciar
pm2 restart conexaogoias

# Parar
pm2 stop conexaogoias

# Iniciar
pm2 start conexaogoias
```

### **Gerenciamento do Nginx**
```bash
# Testar configuração
nginx -t

# Recarregar
systemctl reload nginx

# Reiniciar
systemctl restart nginx

# Ver status
systemctl status nginx
```

### **Deploy de Atualizações**
```bash
cd /var/www/conexaogoias
./scripts/quick-deploy.sh
```

### **Monitoramento**
```bash
cd /var/www/conexaogoias
./scripts/monitor.sh
```

## 🔧 TROUBLESHOOTING

### **Problemas Comuns**

**1. Aplicação não inicia:**
```bash
pm2 logs conexaogoias
pm2 restart conexaogoias
```

**2. Nginx não funciona:**
```bash
nginx -t
systemctl status nginx
tail -f /var/log/nginx/error.log
```

**3. SSL não funciona:**
```bash
certbot certificates
certbot renew --dry-run
```

**4. Verificar recursos:**
```bash
htop
df -h
free -h
```

## ✅ CHECKLIST FINAL

- [ ] Servidor Ubuntu configurado
- [ ] Node.js 18 instalado
- [ ] PM2 configurado
- [ ] Nginx configurado
- [ ] SSL configurado
- [ ] Firewall configurado
- [ ] Aplicação rodando
- [ ] Domínio funcionando
- [ ] Logs configurados
- [ ] Monitoramento ativo

## 🎉 RESULTADO FINAL

Sistema 100% funcional em servidor Ubuntu da DigitalOcean com:
- ✅ Aplicação Next.js rodando
- ✅ Nginx como proxy reverso
- ✅ SSL/HTTPS configurado
- ✅ PM2 para gerenciamento de processos
- ✅ Monitoramento e logs
- ✅ Segurança configurada
- ✅ Deploy automatizado

**Sistema pronto para produção! 🚀**

## 📞 SUPORTE

Se encontrar problemas:
1. Execute `./scripts/monitor.sh` para diagnóstico
2. Verifique logs: `pm2 logs conexaogoias`
3. Teste configuração: `nginx -t`
4. Verifique recursos: `htop`, `df -h`
