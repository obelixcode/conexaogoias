# 🚀 Deploy Completo - DigitalOcean Ubuntu Server

## 📋 Pré-requisitos

- Servidor Ubuntu 20.04+ na DigitalOcean
- Acesso SSH ao servidor
- Domínio configurado (opcional)
- Chave SSH configurada

## 🔧 1. CONFIGURAÇÃO INICIAL DO SERVIDOR

### **1.1 Conectar ao Servidor**
```bash
ssh root@SEU_IP_DO_SERVIDOR
```

### **1.2 Atualizar Sistema**
```bash
apt update && apt upgrade -y
```

### **1.3 Instalar Dependências Básicas**
```bash
apt install -y curl wget git unzip software-properties-common
```

### **1.4 Instalar Node.js 18**
```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### **1.5 Instalar PM2 (Process Manager)**
```bash
npm install -g pm2
```

### **1.6 Instalar Nginx**
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

### **1.7 Instalar Certbot (SSL)**
```bash
apt install certbot python3-certbot-nginx -y
```

## 🚀 2. DEPLOY DA APLICAÇÃO

### **2.1 Criar Diretório da Aplicação**
```bash
mkdir -p /var/www/conexaogoias
cd /var/www/conexaogoias
```

### **2.2 Clonar Repositório**
```bash
git clone https://github.com/obelixcode/conexaogoias.git .
```

### **2.3 Instalar Dependências**
```bash
npm install --legacy-peer-deps
```

### **2.4 Configurar Variáveis de Ambiente**
```bash
nano .env.production
```

**Conteúdo do arquivo `.env.production`:**
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

### **2.5 Fazer Build da Aplicação**
```bash
npm run build
```

### **2.6 Configurar PM2**
```bash
# Usar o ecosystem.config.js já criado
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 3. CONFIGURAÇÃO DO NGINX

### **3.1 Criar Configuração do Site**
```bash
nano /etc/nginx/sites-available/conexaogoias
```

**Conteúdo do arquivo:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Main location
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### **3.2 Ativar Site**
```bash
ln -s /etc/nginx/sites-available/conexaogoias /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔒 4. CONFIGURAÇÃO SSL (Let's Encrypt)

### **4.1 Obter Certificado SSL**
```bash
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### **4.2 Configurar Renovação Automática**
```bash
crontab -e
```

**Adicionar linha:**
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 5. CONFIGURAÇÕES DE SEGURANÇA

### **5.1 Configurar Firewall**
```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
```

### **5.2 Configurar Usuário Não-Root**
```bash
# Criar usuário
adduser deploy
usermod -aG sudo deploy

# Configurar SSH
cp -r /root/.ssh /home/deploy/
chown -R deploy:deploy /home/deploy/.ssh

# Dar permissões ao diretório da aplicação
chown -R deploy:deploy /var/www/conexaogoias
```

### **5.3 Configurar Logrotate**
```bash
nano /etc/logrotate.d/conexaogoias
```

**Conteúdo:**
```
/var/www/conexaogoias/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 deploy deploy
}
```

## 📊 6. MONITORAMENTO E LOGS

### **6.1 Configurar Logs do PM2**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### **6.2 Monitoramento de Recursos**
```bash
# Instalar htop para monitoramento
apt install htop -y

# Verificar status da aplicação
pm2 status
pm2 logs conexaogoias
```

## 🔄 7. SCRIPT DE ATUALIZAÇÃO

### **7.1 Criar Script de Deploy**
```bash
nano /var/www/conexaogoias/deploy.sh
```

**Conteúdo:**
```bash
#!/bin/bash

echo "🚀 Iniciando deploy do Conexão Goiás..."

# Ir para diretório da aplicação
cd /var/www/conexaogoias

# Parar aplicação
pm2 stop conexaogoias

# Fazer backup
cp -r .next .next.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar código
git pull origin main

# Instalar dependências
npm install --legacy-peer-deps

# Fazer build
npm run build

# Iniciar aplicação
pm2 start conexaogoias

# Verificar status
pm2 status

echo "✅ Deploy concluído!"
```

### **7.2 Tornar Script Executável**
```bash
chmod +x /var/www/conexaogoias/deploy.sh
```

## 🛠️ 8. COMANDOS ÚTEIS

### **8.1 Gerenciamento da Aplicação**
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

# Monitorar recursos
pm2 monit
```

### **8.2 Gerenciamento do Nginx**
```bash
# Testar configuração
nginx -t

# Recarregar configuração
systemctl reload nginx

# Reiniciar Nginx
systemctl restart nginx

# Ver status
systemctl status nginx
```

### **8.3 Logs do Sistema**
```bash
# Logs da aplicação
tail -f /var/www/conexaogoias/logs/*.log

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do sistema
journalctl -u nginx
```

## 🔍 9. TROUBLESHOOTING

### **9.1 Problemas Comuns**

**Aplicação não inicia:**
```bash
# Verificar logs
pm2 logs conexaogoias

# Verificar se a porta está em uso
netstat -tlnp | grep :3000

# Verificar variáveis de ambiente
cat .env.production
```

**Nginx não funciona:**
```bash
# Testar configuração
nginx -t

# Verificar se está rodando
systemctl status nginx

# Verificar logs
tail -f /var/log/nginx/error.log
```

**SSL não funciona:**
```bash
# Verificar certificado
certbot certificates

# Renovar certificado
certbot renew --dry-run
```

### **9.2 Verificação de Saúde**
```bash
# Verificar se tudo está funcionando
curl -I http://localhost:3000
curl -I https://seu-dominio.com

# Verificar recursos
htop
df -h
free -h
```

## 📈 10. OTIMIZAÇÕES DE PERFORMANCE

### **10.1 Configurações do Node.js**
```bash
# Adicionar ao .env.production
NODE_OPTIONS="--max-old-space-size=1024"
```

### **10.2 Configurações do Nginx**
```bash
# Editar /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;
```

### **10.3 Configurações do Sistema**
```bash
# Aumentar limites de arquivo
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
```

## ✅ 11. CHECKLIST FINAL

- [ ] Servidor Ubuntu configurado
- [ ] Node.js 18 instalado
- [ ] PM2 configurado
- [ ] Nginx configurado
- [ ] SSL configurado
- [ ] Firewall configurado
- [ ] Aplicação rodando
- [ ] Domínio funcionando
- [ ] Logs configurados
- [ ] Backup configurado
- [ ] Monitoramento ativo

## 🎉 RESULTADO FINAL

Sistema 100% funcional em servidor Ubuntu da DigitalOcean com:
- ✅ Aplicação Next.js rodando
- ✅ Nginx como proxy reverso
- ✅ SSL/HTTPS configurado
- ✅ PM2 para gerenciamento de processos
- ✅ Monitoramento e logs
- ✅ Segurança configurada
- ✅ Backup automático
- ✅ Deploy automatizado

**Sistema pronto para produção! 🚀**
