#!/bin/bash

echo "🧹 Forçando limpeza completa de cookies..."

# Fazer logout via API
echo "🔧 Fazendo logout via API..."
curl -s -X DELETE http://localhost:3302/api/auth/session > /dev/null

# Limpar cookies do navegador via JavaScript
echo "🔧 Limpando cookies do navegador..."
cat > /tmp/clear_cookies.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Limpar Cookies</title>
</head>
<body>
    <h1>Limpando Cookies...</h1>
    <script>
        // Limpar todos os cookies
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Limpar localStorage
        localStorage.clear();
        
        // Limpar sessionStorage
        sessionStorage.clear();
        
        alert('Cookies limpos! Redirecionando...');
        window.location.href = 'http://localhost:3302/admin/login';
    </script>
</body>
</html>
EOF

echo "✅ Script de limpeza criado em /tmp/clear_cookies.html"
echo "🌐 Abra http://localhost:3302/admin/login no navegador"
echo "🔧 Ou execute: open /tmp/clear_cookies.html"
