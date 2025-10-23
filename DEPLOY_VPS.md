# Deploy em VPS - Digital Ocean

Este guia explica como fazer o deploy da aplicação Next.js em uma VPS da Digital Ocean.

## Pré-requisitos

- VPS com Ubuntu 20.04+ ou similar
- Node.js 18+ instalado
- Nginx instalado
- Domínio configurado (opcional)

## 1. Configuração do Servidor

### 1.1 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar Node.js 18+

```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 1.3 Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 1.4 Instalar Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 2. Deploy da Aplicação

### 2.1 Clonar o repositório

```bash
# Criar diretório para a aplicação
sudo mkdir -p /var/www/conexaogoias
sudo chown -R $USER:$USER /var/www/conexaogoias

# Clonar o repositório
cd /var/www/conexaogoias
git clone https://github.com/seu-usuario/conexaogoias.git .
```

### 2.2 Instalar dependências

```bash
cd /var/www/conexaogoias
npm install --legacy-peer-deps
```

### 2.3 Configurar variáveis de ambiente

```bash
# Criar arquivo de produção
sudo nano /var/www/conexaogoias/.env.production
```

Adicionar as seguintes variáveis:

```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742

# App URL (URL da VPS)
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aconexaogoias.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyUl3I0mJQ7KPY\nPe4fT15J4IMUswthouvozQxxbxKAnQfPBA7OYmz+frinTE7pBQY2wwyBRJ389v0l\nc2b2u6WhSkhCe9+6CKDGfwFrznkM9tP7rHtVJfXODvhts1YgQiQeg0G+mlI5uylE\n0w2SVMoqENpMsRc2hn5jVg74m23NbWRzxvqcqkdqtF31s1Umk+SEm3Y4unM12S6K\nnOsZdDuhVs0bbtWx4J0avsUJV2q/XUn4Ij5CfZCMzzp3DbXigd1K0WCvfKmNJlAr\nS/knNDG+UGCzkv2Bk0RF0H0OnxAZzdg+CwxZfoeTnWAye8IVatbXdx65lz7j2aLs\nvGqnJM2vAgMBAAECggEAWO6sGCYYY0yJcCR+t/3Aw+5k4TNkFzcGGW396SqgWyU1\nikB3U+WRfyDa3ZC4gA0B6ti+yU9bzZeua3mQ3bd65KQjwoh97Q01hZk8r7Pi+hy1\nXvxH7BDI9JHRwwAgEWl7Ev6aEMFtBZ66d7kcOSDxTCZogLwHHCnaKZd3UvRNQBgb\n088DU0Vm7i00SWWlpzOBanO7hA5lWMZm076eWSU0uk6FyEMR1bp6tO1vstUKSOUW\nMDdxe2URcrzyjWBtOOrmiqC6WYgrVcR4FuL8pCc/jekqXs2w7yrWHr9S0AEpj1Ym\nJEPsBE45pIX7SJqmA76EpbfPALICQIG9jYR2Vr1sFQKBgQDXnVJcp+V68AGLehdm\nPQNeIyzaY2ivMAcQJRdZaQo+WlMYkHzTKOxBJ4tTMoyD1WM4BR8Nh6oN7voMCcEG\nCDiZ6nFdKw33VteT4hryteGOFUzMONWaxMTNe3MjzGdzb9MRm9GK8uKuA9EAfRyL\np53/NLrA4wDKw0e6zZcurILvcwKBgQDTuNyhiooLv9CkAhbK9Wnv+WZyktOQ5B+j\nwzrOu7U/oEVuPYPLcWtguH/dcHKpHcshKVRcSI/ezlwL0xQfwZjpaqIqt3v2Ib21\n91t9FnCSxa3W/C+01qXHrPZH5z1QQSL25ODcAkLnpHyfEYh4Gturhn0HE/t7IxyU\ndw6NeGNh1QKBgE9VkaKKHIPZn5fkeouh04Vlx/ErNq+PKmokW60IWz6KGZ0mPOet\nXRC0Li2UoeM4NuO77qsZydaKofKf/CfuCnWHr+KqHt9tUrEVNvkrNy0CZVmXZ/Ek\niY1Z6Qm5Ai+Va8JE5RsNN57zxIk7f69bI2Vtz3F9lSMGK3RuhTwlOaBFAoGANkK+\naLg0wOYb9qyCYumaiOIGG379sbiFU1cJj0oUHYZZxPMG//DFcDhYrMvQ1v7HvGv3\nLt9538RLWsxx7+GR6uBlR0VXA7GKCUSnsds6ZqM69koTf+ky+4WcaLkewZ6v806d\nQkViGDPTrIC11PItMjx5doLshJZvEK2ikSc1cTECgYEA0XAHWkqhx7gp6UrV0vcm\ngG1eds4zVp37vWuekekKF0KKDUoa8wewzL+ZSiMZUDRX8j8L2i9fOZjBF0Nc59Tx\nZEuOoTtcL4aU4Ga90TJhT2oZbLhUQ70o+UFPN4Wn1Rm8uDL7VFXf3+zkcGVaGOj3\ntHhW977M1UyugdHFkIRCwfw=\n-----END PRIVATE KEY-----\n"
```

### 2.4 Build da aplicação

```bash
cd /var/www/conexaogoias
npm run build
```

## 3. Configuração do PM2

### 3.1 Criar arquivo de configuração do PM2

```bash
sudo nano /var/www/conexaogoias/ecosystem.config.js
```

Adicionar o seguinte conteúdo:

```javascript
module.exports = {
  apps: [{
    name: 'conexaogoias',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/conexaogoias',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 3.2 Iniciar aplicação com PM2

```bash
cd /var/www/conexaogoias
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Configuração do Nginx

### 4.1 Criar configuração do site

```bash
sudo nano /etc/nginx/sites-available/conexaogoias
```

Adicionar o seguinte conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

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
    }
}
```

### 4.2 Ativar o site

```bash
sudo ln -s /etc/nginx/sites-available/conexaogoias /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Configuração SSL (Let's Encrypt)

### 5.1 Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Obter certificado SSL

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## 6. Comandos Úteis

### 6.1 Gerenciamento da aplicação

```bash
# Ver status da aplicação
pm2 status

# Ver logs
pm2 logs conexaogoias

# Reiniciar aplicação
pm2 restart conexaogoias

# Parar aplicação
pm2 stop conexaogoias

# Iniciar aplicação
pm2 start conexaogoias
```

### 6.2 Atualizar aplicação

```bash
cd /var/www/conexaogoias
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart conexaogoias
```

### 6.3 Verificar logs do Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 7. Monitoramento

### 7.1 Configurar monitoramento básico

```bash
# Instalar htop para monitoramento
sudo apt install htop -y

# Verificar uso de memória e CPU
htop

# Verificar espaço em disco
df -h
```

### 7.2 Backup

```bash
# Criar script de backup
sudo nano /var/www/backup.sh
```

Adicionar:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /var/backups/conexaogoias_$DATE.tar.gz /var/www/conexaogoias
find /var/backups -name "conexaogoias_*.tar.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /var/www/backup.sh
sudo crontab -e
```

Adicionar linha para backup diário:

```
0 2 * * * /var/www/backup.sh
```

## 8. Troubleshooting

### 8.1 Problemas comuns

1. **Aplicação não inicia**
   - Verificar logs: `pm2 logs conexaogoias`
   - Verificar se a porta 3000 está livre: `netstat -tlnp | grep 3000`

2. **Erro 502 Bad Gateway**
   - Verificar se a aplicação está rodando: `pm2 status`
   - Verificar logs do Nginx: `sudo tail -f /var/log/nginx/error.log`

3. **Problemas de permissão**
   - Verificar permissões: `ls -la /var/www/conexaogoias`
   - Corrigir permissões: `sudo chown -R $USER:$USER /var/www/conexaogoias`

### 8.2 Logs importantes

- Aplicação: `pm2 logs conexaogoias`
- Nginx: `/var/log/nginx/error.log`
- Sistema: `journalctl -u nginx`

## 9. Segurança

### 9.1 Firewall

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 9.2 Atualizações de segurança

```bash
# Configurar atualizações automáticas
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 10. Performance

### 10.1 Otimizações do Nginx

```nginx
# Adicionar ao arquivo de configuração do Nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 10.2 Cache do Next.js

A aplicação já está configurada com ISR (Incremental Static Regeneration) para melhor performance.

---

## Resumo dos Comandos

```bash
# 1. Instalar dependências
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2

# 2. Deploy da aplicação
sudo mkdir -p /var/www/conexaogoias
sudo chown -R $USER:$USER /var/www/conexaogoias
cd /var/www/conexaogoias
git clone https://github.com/seu-usuario/conexaogoias.git .
npm install --legacy-peer-deps

# 3. Configurar variáveis de ambiente
sudo nano .env.production
# Adicionar variáveis conforme documentado acima

# 4. Build e start
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 5. Configurar Nginx
sudo nano /etc/nginx/sites-available/conexaogoias
# Adicionar configuração conforme documentado acima
sudo ln -s /etc/nginx/sites-available/conexaogoias /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. SSL (opcional)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```
