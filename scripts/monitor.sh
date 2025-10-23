#!/bin/bash

# Script de monitoramento do sistema
# Execute: ./scripts/monitor.sh

echo "📊 Monitoramento do Sistema - Conexão Goiás"
echo "=========================================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Status da Aplicação
echo ""
echo "🚀 Status da Aplicação:"
echo "----------------------"
pm2 status

# 2. Logs recentes
echo ""
echo "📝 Logs Recentes (últimas 10 linhas):"
echo "------------------------------------"
pm2 logs conexaogoias --lines 10

# 3. Status do Nginx
echo ""
echo "🌐 Status do Nginx:"
echo "------------------"
if systemctl is-active --quiet nginx; then
    print_status "Nginx está rodando"
else
    print_error "Nginx não está rodando"
fi

# 4. Status do SSL
echo ""
echo "🔒 Status do SSL:"
echo "----------------"
if command -v certbot &> /dev/null; then
    certbot certificates
else
    print_warning "Certbot não instalado"
fi

# 5. Uso de Recursos
echo ""
echo "💻 Uso de Recursos:"
echo "------------------"
echo "CPU:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

echo "Memória:"
free -h

echo "Disco:"
df -h / | tail -1

# 6. Portas em uso
echo ""
echo "🔌 Portas em Uso:"
echo "----------------"
netstat -tlnp | grep -E ':(80|443|3000)'

# 7. Teste de conectividade
echo ""
echo "🌐 Teste de Conectividade:"
echo "-------------------------"

# Teste local
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Aplicação local (porta 3000) - OK"
else
    print_error "Aplicação local (porta 3000) - ERRO"
fi

# Teste Nginx
if curl -f http://localhost > /dev/null 2>&1; then
    print_status "Nginx (porta 80) - OK"
else
    print_error "Nginx (porta 80) - ERRO"
fi

# 8. Verificar logs de erro
echo ""
echo "🔍 Verificando Logs de Erro:"
echo "----------------------------"

# Logs do Nginx
if [ -f "/var/log/nginx/error.log" ]; then
    ERROR_COUNT=$(tail -100 /var/log/nginx/error.log | grep -c "error" || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        print_warning "Encontrados $ERROR_COUNT erros no Nginx"
        echo "Últimos erros:"
        tail -5 /var/log/nginx/error.log | grep "error"
    else
        print_status "Nenhum erro recente no Nginx"
    fi
fi

# 9. Verificar espaço em disco
echo ""
echo "💾 Espaço em Disco:"
echo "------------------"
df -h

# 10. Verificar processos
echo ""
echo "⚙️  Processos Relacionados:"
echo "-------------------------"
ps aux | grep -E "(node|nginx|pm2)" | grep -v grep

# 11. Verificar configurações
echo ""
echo "⚙️  Configurações:"
echo "----------------"

# Verificar se o arquivo de ambiente existe
if [ -f "/var/www/conexaogoias/.env.production" ]; then
    print_status "Arquivo .env.production encontrado"
else
    print_error "Arquivo .env.production não encontrado"
fi

# Verificar se o build existe
if [ -d "/var/www/conexaogoias/.next" ]; then
    print_status "Build (.next) encontrado"
else
    print_error "Build (.next) não encontrado"
fi

# 12. Resumo
echo ""
echo "📋 Resumo:"
echo "---------"

# Contar problemas
ERRORS=0

# Verificar se PM2 está rodando
if ! pm2 list | grep -q "online"; then
    ((ERRORS++))
fi

# Verificar se Nginx está rodando
if ! systemctl is-active --quiet nginx; then
    ((ERRORS++))
fi

# Verificar se a aplicação responde
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    ((ERRORS++))
fi

if [ $ERRORS -eq 0 ]; then
    print_status "Sistema funcionando corretamente! 🎉"
else
    print_error "Encontrados $ERRORS problemas no sistema"
    echo ""
    echo "🔧 Comandos para resolver:"
    echo "  pm2 restart conexaogoias  - Reiniciar aplicação"
    echo "  systemctl restart nginx   - Reiniciar Nginx"
    echo "  pm2 logs conexaogoias    - Ver logs da aplicação"
    echo "  nginx -t                  - Testar configuração Nginx"
fi

echo ""
echo "🔄 Para monitoramento contínuo:"
echo "  watch -n 5 './scripts/monitor.sh'"
