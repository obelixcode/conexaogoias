#!/bin/bash

echo "🧹 Limpando sessões existentes..."

# Fazer logout via API
echo "🔧 Fazendo logout via API..."
curl -s -X DELETE http://localhost:3302/api/auth/session > /dev/null

echo "✅ Sessões limpas"
echo "🔄 Agora teste o login novamente"
