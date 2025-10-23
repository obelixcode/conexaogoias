# 🌐 Configuração DNS na Cloudflare

## 📋 **Passo a Passo Completo**

### **1. Acesse o Painel da Cloudflare**

1. Faça login em: https://dash.cloudflare.com
2. Selecione o domínio `conexaogoias.com`

### **2. Configure os Registros DNS**

#### **Registro A (Principal):**
```
Tipo: A
Nome: @
Conteúdo: 146.190.174.106
Proxy: ✅ (Laranja - Ativado)
TTL: Auto
```

#### **Registro CNAME (WWW):**
```
Tipo: CNAME
Nome: www
Conteúdo: conexaogoias.com
Proxy: ✅ (Laranja - Ativado)
TTL: Auto
```

### **3. Configurações SSL/TLS**

1. Vá para **SSL/TLS** → **Visão Geral**
2. Configure:
   - **Modo de criptografia:** `Flexível` ou `Completo`
   - **Edge Certificates:** ✅ Ativado
   - **Always Use HTTPS:** ✅ Ativado

### **4. Configurações de Performance**

#### **Speed:**
- **Auto Minify:** ✅ CSS, JavaScript, HTML
- **Brotli:** ✅ Ativado

#### **Caching:**
- **Caching Level:** Standard
- **Browser Cache TTL:** 4 horas

### **5. Configurações de Segurança**

#### **Security:**
- **Security Level:** Medium
- **Bot Fight Mode:** ✅ Ativado (opcional)

#### **Page Rules (Opcional):**
```
URL: conexaogoias.com/*
Settings: Cache Level = Cache Everything
```

## 🔧 **Configurar Nginx na VPS**

Execute o script de configuração:

```bash
./scripts/setup-nginx.sh
```

Este script irá:
- ✅ Instalar e configurar Nginx
- ✅ Configurar proxy reverso para porta 3000
- ✅ Configurar SSL com Let's Encrypt
- ✅ Configurar renovação automática do SSL
- ✅ Otimizar performance e segurança

## ⏱️ **Tempo de Propagação**

- **DNS:** 5-15 minutos
- **SSL:** 1-2 minutos após configuração do Nginx
- **Cache Cloudflare:** 1-5 minutos

## 🧪 **Testes Após Configuração**

### **1. Teste DNS:**
```bash
nslookup conexaogoias.com
nslookup www.conexaogoias.com
```

### **2. Teste HTTP/HTTPS:**
- ✅ http://conexaogoias.com (deve redirecionar para HTTPS)
- ✅ https://conexaogoias.com
- ✅ https://www.conexaogoias.com

### **3. Teste Admin:**
- ✅ https://conexaogoias.com/admin/login

## 🔍 **Verificação de Status**

### **Cloudflare:**
- Status: ✅ Proxied (Laranja)
- SSL: ✅ Ativo
- Performance: ✅ Otimizado

### **VPS:**
- Nginx: ✅ Rodando
- PM2: ✅ Rodando
- SSL: ✅ Válido

## 🚨 **Problemas Comuns**

### **DNS não resolve:**
- Aguarde 15 minutos
- Verifique se os registros estão corretos
- Limpe cache do navegador

### **SSL não funciona:**
- Execute: `certbot --nginx -d conexaogoias.com -d www.conexaogoias.com`
- Verifique se o Nginx está rodando

### **Site não carrega:**
- Verifique se PM2 está rodando: `pm2 status`
- Verifique logs: `pm2 logs conexaogoias`
- Teste local: `curl http://localhost:3000`

## 📞 **Suporte**

Se houver problemas:
1. Execute: `./scripts/debug-vps.sh`
2. Verifique logs: `pm2 logs conexaogoias --follow`
3. Teste DNS: `nslookup conexaogoias.com`
